'use client'

import db from '../../../firebase';
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react';
import { doc, getDoc } from "firebase/firestore";

export default function Set({ params }) {
    const { user } = useUser()
    const set = decodeURI(params.slug);
    const [cards, setCards] = useState([]);
    const [cardNum, setCardNum] = useState(0);
    const [front, setFront] = useState(true);

    const getCards = async () => {
        if (!user) return;

        const docRef = doc(db, "users/" + user.id + "/sets", set);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setCards(docSnap.data().cards);
        }
    }

    useEffect(() => {
        getCards()
    }, [user])

    function getCard() {
        if (cards.length == 0) return;

        if (front) {
            return cards[cardNum].front;
        } else {
            return cards[cardNum].back;
        }
    }

    function flip() {
        setFront(!front);
    }

    function prev() {
        if (cardNum > 0) {
            setCardNum(cardNum - 1);
            setFront(true);
        }
    }

    function next() {
        if (cardNum < 19) {
            setCardNum(cardNum + 1);
            setFront(true);
        }
    }

    return (
        <>
            <div className="flex justify-center items-center text-lg md:text-xl">
                <label className="mb-3">Reviewing: {set}</label>
            </div>
            <div className="mt-40 block text-center text-lg md:text-xl">
                <label>{front ? "Front" : "Back"}</label>
                <div className="mt-3 flex justify-center items-center">
                    <button onClick={() => prev()} className="mr-10">&larr;</button>
                    <div className="flex flex-col  justify-center items-center text-lg md:text-xl">
                        <div className="text-center group relative p-6 bg-white border border-gray-200 rounded-lg shadow mb-2 break-all text-2xl font-bold tracking-tight text-gray-900">
                            <div className="mt-3">
                                <button onClick={() => flip()}>{getCard()}</button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => next()} className="ml-10">&rarr;</button>
                </div> 
            </div>
        </>
    )
}
