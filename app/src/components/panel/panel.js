import React from "react";

// some panel buttons
const Panel = () => {
    return (
        <>
            <button className="uk-button uk-button-primary uk-margin-small-right" type="button" uk-toggle='target: #modal-save'> Сохранить </button>
            <button className="uk-button uk-button-primary uk-margin-small-right" uk-toggle='target: #modal-meta'> Редактировать МЕТА </button>
            <button className="uk-button uk-button-danger uk-margin-small-right" uk-toggle='target: #modal-logout'> Выйти </button>
        </>
    )
}

export default Panel;