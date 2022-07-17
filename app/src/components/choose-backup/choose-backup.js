import React from "react";
import UIkit from "uikit";

// choose backup to restore
const ChooseBackup = ({data, redirect, dropDownBackups}) => {

    const allBackups = data.map((backup) => {
        return (
            <li key={backup.file}>
                <a href="#" onClick={(e) => all(e, backup.file)}>Резервная копия от {backup.time}</a>
            </li>
        ) 
    });

    function all(e, page) { 
        dropDownBackups();       
        redirect(e, page);
       
    }

    let msg;
    if(data.length < 1) {
        msg = <div>Резервные копии не найдены</div>
    }

    return (
        <div className="dropdown-backups">
            <button className="uk-button uk-button-default" type="button" onClick={() => dropDownBackups()}> Восстановить </button> 
            <div className="dropdown-menu-backups">
                {msg}
                {allBackups}
            </div>
        </div>
    )
}

export default ChooseBackup;