import axios from 'axios';

// editing images on the page
export default class EditorImage {
    constructor(element, virtualElement, ...[isLoaded, isLoading, showNotifications]) {
        this.element = element;
        this.virtualElement = virtualElement; 
        this.element.addEventListener('click', () => this.onClick());
        this.imgUploader = document.querySelector('#img-upload');     
        this.isLoaded = isLoaded;
        this.isLoading = isLoading;
        this.showNotifications = showNotifications;
        
    }

    onClick() {
        this.imgUploader.click();
        this.imgUploader.addEventListener('change', () => {           
            if(this.imgUploader.files && this.imgUploader.files[0]) {
                let formData = new FormData();
                formData.append('image', this.imgUploader.files[0]);
                this.isLoading();
                axios
                    .post('./api/uploadImage.php', formData, {
                        header: {
                            "Content-type": "multipart/form-data"     
                        }
                    })
                    .then((response) => {
                        this.virtualElement.src = this.element.src = `./img/${response.data.src}`; 
                    })
                    .catch(() => this.showNotifications('Ошибка сохранения', 'danger'))
                    .finally(() => {
                        this.imgUploader.value = '';        
                        this.isLoaded();                   
                    })
            }
        })
    }
}