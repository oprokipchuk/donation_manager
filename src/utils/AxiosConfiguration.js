import axios from 'axios';
import {CookieManager} from './CookieManager';

axios.defaults.headers.common = {'Authorization': `Bearer ${CookieManager.getCookie("client-access-token")}`};
export default axios;