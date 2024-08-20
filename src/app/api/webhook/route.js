import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server"
import { doc, setDoc } from "firebase/firestore"; 
import db from '../../../firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});

const endpointSecret = process.env.WEBHOOK_SECRET;

const fulfillOrder = async (customerEmail) => {
    try {
        const email = customerEmail.toLowerCase();
        await setDoc(doc(db, "/payments/" + email), {
            payed: true
        });
        return true;
    } catch (error) {
        console.error(error)
        return false;
    }
}

const handleCompletedCheckoutSession = async (event) => {
    try {
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            {
                expand: ["line_items"],
            }
        );
        const lineItems = sessionWithLineItems.line_items;

        if (!lineItems) return false;

        const ordersFulfilled = await fulfillOrder(
            event.data.object.customer_details.email
        );

        if (ordersFulfilled) return true;

        console.error("error fulfilling orders");
        return false;
    } catch (error) {
        console.error("error handlingCompletedCheckoutSession", error);
        return false;
    }
};

const handleCustomerSubscriptionUpdate = async (event) => {
    try {
        const customerID = event.data.object?.customer;
        const customer = await stripe.customers.retrieve(customerID);
        const subscriptionCancel = event.data.object?.cancel_at;
        const email = customer.email;
        if (subscriptionCancel) {
            await setDoc(doc(db, "/payments/" + email), {
                payed: false
            });
        }
        return true;
    } catch (error) {
        console.error("error unsubbing customer");
        return false;
    }
};

export async function POST(req) {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;
    let result = "Webhook called.";

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    switch (event.type) {
        case "checkout.session.completed":
            const savedSession = await handleCompletedCheckoutSession(event);
            if (!savedSession)
                return NextResponse.json(
                    { error: "Unable to save checkout session" },
                    { status: 500 }
                );
            break;
        case "customer.subscription.updated":
            const updated = await handleCustomerSubscriptionUpdate(event);
            if(!updated)
                return NextResponse.json(
                    { error: "Unable to update customer subscription "},
                    { status: 500 }
                );
            break;
        default:
            console.warn(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true, status: result });
}