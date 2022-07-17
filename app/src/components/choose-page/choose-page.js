import React from "react";
import UIkit from "uikit";

// choose page to redirect
const ChoosePage = ({data, redirect, dropDown}) => {

    function all(e, page) {       
        redirect(e, page);
        dropDown();
    }
    
    const allPages = data.map((page, i) => {
        return (
            <a href="#" key={i} onClick={(e) => all(e, page)}>{page}</a>
        )
    })

    return (
        <div className="dropdown">
            <button className="uk-button uk-button-primary uk-margin-small-right" type="button" onClick={() => dropDown()}> Открыть </button>
            <div className="dropdown-menu">
                {allPages}
            </div>
        </div>
    )
}

export default ChoosePage;