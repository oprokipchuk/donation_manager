import React from 'react';

export class CookieManager extends React.Component{

    static getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    static setCookie(name, value) {
        document.cookie=`${name}=${value}; path=/; max-age=36000000;`;
    }

}