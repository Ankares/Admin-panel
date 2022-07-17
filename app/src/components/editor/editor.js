import axios from 'axios';
import React, {Component} from 'react';
import DOMHelper from '../../helpers/dom-helpers.js';
import Spinner from '../spinner/spinner.js';
import Panel from '../panel/panel.js';
import ConfirmModal from '../confirn-modal/confirm-modal.js';
import ChoosePage from '../choose-page/choose-page.js';
import ChooseBackup from '../choose-backup/choose-backup.js';
import EditorMeta from '../editor-meta/editor-meta.js';
import EditorImage from '../editor-image/editor-image.js';
import Login from '../login/login.js';
import UIKit from 'uikit';

import '../../helpers/iframeLoader.js';  


// Admin Panel (editing text nodes and images)
export default class Editor extends Component {
    constructor() {
        super();
        this.currentPage = 'index.html';
        this.state = {
            pageList: [],
            backupsList: [],
            newPageName: "",
            loading: true,
            auth: false,
            loginError: false,
            loginLengthError: false
        }
        this.isLoading = this.isLoading.bind(this);
        this.isLoaded = this.isLoaded.bind(this);
        this.init = this.init.bind(this);
        this.login = this.login.bind(this);
        this.restoreBackup = this.restoreBackup.bind(this);
        this.save = this.save.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        this.checkAuth();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.auth !== prevState.auth) {
            this.init(null, this.currentPage);
        }
    }

    checkAuth() {
        axios
            .get('./api/checkAuth.php')
            .then(res => {
                this.setState({
                    auth: res.data.auth
                })
            })
    }

    login(pass) {
        if (pass.length > 5) {
            axios
                .post('./api/login.php', {"password": pass})
                .then(res => {
                    this.setState({
                        auth: res.data.auth,
                        loginError: !res.data.auth,
                        loginLengthError: false
                    })
                })
        } else {
            this.setState({
                loginError: false,
                loginLengthError: true
            })
        }
    }

    logout() {
        axios
            .get('./api/logout.php')
            .then(() => {
                window.location.replace('/');  
            })
    }

    init(e, page) {        
        if(e) {
            e.preventDefault();
        }
        
        if(this.state.auth) {
            this.isLoading();
            this.iframe = document.querySelector('iframe');
            this.open(page, this.isLoaded);   
            this.loadPageList();         
            this.loadBackupsList();    
        }    
    }

    // open page->selecting text nodes/images->copy clear page->save and open temp page->enable editing only on temp page->inject styles
    open(page, callback) {
        this.currentPage = page;     

        axios
            .get(`../${page}?rnd=${Math.random()}`)     
            .then(res => DOMHelper.parseStrToDOM(res.data)) 
            .then(DOMHelper.wrapTextNodex)  
            .then(DOMHelper.wrapImages)    
            .then(dom => {       
                this.virtualDom = dom;  
                return dom;
            })
            .then(DOMHelper.serializeDOMToString) 
            .then(html => axios.post('./api/saveTempPage.php', {'html': html})) 
            .then(() => this.iframe.load('../temporaryPage.html'))  
            .then(() => axios.post('./api/deleteTempPage.php'))    
            .then(() => this.enableEditing())              
            .then(() => this.injectStyle())                
            .then(callback);                               

        this.loadBackupsList();         
    }

    enableEditing() {
        this.iframe.contentDocument.body.querySelectorAll('text-editor').forEach(element => {
            element.contentEditable = 'true';
            element.addEventListener('input', () => {
                this.onTextEditing(element)
            })
        });

        this.iframe.contentDocument.body.querySelectorAll('[editableImageId]').forEach(element => {
            const id = element.getAttribute('editableImageId');
            const virtualElement = this.virtualDom.body.querySelector(`[editableImageId="${id}"]`);

            new EditorImage(element, virtualElement, this.isLoaded, this.isLoading, this.showNotifications); 
        });
    }

    injectStyle() {
        const style = this.iframe.contentDocument.createElement("style");
        style.innerHTML = `
            text-editor:hover {
                padding:5px;
                outline: none;
                border-left: 5px solid orange;
                border-right: 5px solid orange;
            }
            text-editor:focus {
                padding:5px;
                outline: none;
                border-left: 5px solid red;
                border-right: 5px solid red;
            }
            [editableImageId]:hover{
                outline: 3px solid orange;
                outline-offset: 8px;
            }
        `;
        this.iframe.contentDocument.head.appendChild(style);
    }

    showNotifications(message, status) {
        UIKit.notification({message, status});
    }

    // place changes to 'clear page' which can not be editing
    
    onTextEditing(element) {
        const id = element.getAttribute('nodeid');
        this.virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML; 
    }

    // save changes
    async save() {
        this.isLoading();                          
        const newDom = this.virtualDom.cloneNode(this.virtualDom); 
        DOMHelper.unwrapTextNodes(newDom);   
        DOMHelper.unWrapImages(newDom);     
        const html = DOMHelper.serializeDOMToString(newDom); 
        await axios             
            .post('./api/savePage.php', {'pageName': this.currentPage, 'html': html})
            .then(() => this.showNotifications('Успешно сохранено', 'success'))    
            .catch(() => this.showNotifications('Ошибка сохранения', 'danger'))
            .finally(this.isLoaded);              

        this.loadBackupsList();                   
    }
    
    loadPageList() {
        axios              
            .get('./api/pageList.php')
            .then(res => this.setState({pageList: res.data}))
    }

    loadBackupsList () {
        axios
            .get('./backups/backups.json')
            .then(res => this.setState({backupsList: res.data.filter(backup => {
                return backup.page === this.currentPage;
            })}))
    }

    restoreBackup(e, backup) {            
        if (e) {
            e.preventDefault();
        }
        UIKit.modal.confirm('Вы действительно хотите восстановить данную копию? Все несохранённые данные будут удалены', {labels: {ok: 'Восстановить', cancel: 'Отмена'}})
        .then(() => {
            this.isLoading();
            return axios      
                .post('./api/restoreBackup.php', {"page": this.currentPage, "file": backup})
        })
        .then(() => {
            this.open(this.currentPage, this.isLoaded);
        })
    }

    isLoading() {
        this.setState({
            loading: true
        })
    }

    isLoaded() {
        this.setState({
            loading: false
        })
    }

    dropDown() {
        document.querySelector('.dropdown-menu').classList.toggle('showMenu');
    }
    
    dropDownBackups() {
        document.querySelector('.dropdown-menu-backups').classList.toggle('showMenuBackups');   
    }

    render() {

        const modal = true;
        const {loading, pageList, backupsList, auth, loginError, loginLengthError} = this.state;
        let spinner;
        
        loading ? spinner = <Spinner active/> : spinner = <Spinner/>

        if (!auth) {          
            return <Login login={this.login} lengthErr={loginLengthError} loginErr={loginError}/>
        }

        return(
            <>
            
                <iframe src="" frameBorder="0"></iframe>
                <input id="img-upload" type="file" accept='image/*' style={{display: 'none'}}></input>
                
                {spinner}

                <div className="panel">
                    <ChoosePage data={pageList} dropDown={this.dropDown} redirect={this.init}/>
                    <ConfirmModal 
                        modal={modal}
                        target={'modal-save'}
                        method={this.save}
                        text={{
                            title: 'Сохранение',
                            description: 'Вы действительно хотите сохранить изменения?',
                            btn: 'Опубликовать'
                        }}/>
                    <ConfirmModal 
                        modal={modal}
                        target={'modal-logout'}
                        method={this.logout}
                        text={{
                            title: 'Выход',
                            description: 'Вы действительно хотите выйти?',
                            btn: 'Выйти'
                        }}/>
                    {this.virtualDom ? <EditorMeta modal={modal} target={'modal-meta'} virtualDom={this.virtualDom}/> : false}
                    <Panel/>
                    <ChooseBackup data={backupsList} dropDownBackups={this.dropDownBackups} redirect={this.restoreBackup}/>
                </div>
            </>
        )
    }
}