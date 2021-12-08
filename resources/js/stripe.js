import { loadStripe } from '@stripe/stripe-js'
import { placeOrder } from './apiService.js'
import { CardWidget } from './CardWidget'

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51K0QPdSDgnAAIb6QSYH8n88jwH0lXZTR5raUVyBGUOl7tJQTq97tw08wvTSpl8ugJNBSbzPFVo2JSJSpxXwSlLIh00M6vBOAmN');
    let card = null;

    const paymentType = document.querySelector('#paymentType')
    if (!paymentType) {
        return;
    }

    paymentType.addEventListener('change', (e) => {

        if (e.target.value === 'card') {
            // Display Widget
            card = new CardWidget(stripe)
            card.mount()
        } else {
            card.destroy()
            card = null
        }
    })

    //Ajax call
    const paymentForm = document.querySelector('#payment-Form')
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            let formData = new FormData(paymentForm)
            let formObject = {}
            for (let [key, value] of formData.entries()) {
                formObject[key] = value
            }


            if (!card) {
                placeOrder(formObject)
                return;
            }

            const token = await card.createToken()
            formObject.stripeToken = token.id
            placeOrder(formObject)

        })

    }
}
