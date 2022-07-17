import React , {Component} from 'react';

// admin panel login
export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pass: ""
        }
    }

    onPasswordChange(e) {
        this.setState({
            pass: e.target.value
        })
    }

    render() {
        const {pass} = this.state;
        const {login, lengthErr, loginErr} = this.props;

        let renderLogErr, renderLengthErr;

        loginErr ? renderLogErr = <span className='login-error'>Введён неправильный пароль!</span> : null;
        lengthErr ? renderLengthErr = <span className='login-error'>Пароль должен быть длиннее 5 символов</span> : null;

        return (
            <div className='login-container'>
                <div className='login'>
                    <h2 className='uk-modal-title uk-text-center'>Авторизация</h2>
                    <div className="uk-margin-top uk-text-lead">Пароль:</div>
                    <input 
                        type="password" 
                        name="" id="" 
                        className='uk-input uk-margin-top' 
                        placeholder='Пароль' 
                        value={pass} 
                        onChange={(e) => this.onPasswordChange(e)}>
                    </input>
                    {renderLogErr}
                    {renderLengthErr}
                    <button 
                        className='uk-button uk uk-button-primary uk-margin-top' 
                        type="button"
                        onClick={() => login(pass)}>Вход
                    </button>
                </div>
            </div>
        )
    }
}