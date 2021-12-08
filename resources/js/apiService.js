import axios from 'axios';
import Noty from 'noty';

export function placeOrder(formObject) {

    axios.post('/orders', formObject).then((res) => {
        if (res.data.message) {
            new Noty({
                type: 'success',
                timeout: 1000,
                progressBar: false,
                text: res.data.message
            }).show();
            setTimeout(() => {
                window.location.href = '/customer/orders'
            }, 1000)
        } else if (res.data.error) {
            console.log(res.data.error)
            new Noty({
                type: 'error',
                timeout: 2000,
                progressBar: false,
                text: res.data.error
            }).show();
        }

    }).catch((err) => {
        new Noty({
            type: 'error',
            timeout: 1000,
            progressBar: false,
            text: res.data.error
        }).show();
        console.log(err)
    })
}