'use client'

import db from '../../firebase';
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function Sets() {
    const { user } = useUser()
    const [sets, setSets] = useState([])

    async function getSets() {
      if (user) {
        const collectionRef = collection(db, "users/" + user.id + "/sets");
        const querySnapshot = await getDocs(collectionRef);
        var tempArray = [];
        querySnapshot.forEach((doc) => {
          tempArray.push(doc.id);
        });
        setSets(tempArray);
      }
    }
  
    useEffect(() => {
        getSets()
      }, [user])

      const del = (set) => {
        deleteDoc(doc(db, "users/" + user.id + "/sets", set));
        getSets();
      }

      return (
        <>
        <div className="my-4 md:container md:mx-auto">
          <label className="text-base md:text-lg">Saved Sets</label>
          <div className="grid grid-cols-4 gap-2">
            {sets.map((set, index) => (
              <div className="group relative max-w-full p-6 bg-white border border-gray-200 rounded-lg shadow" key={index}>
                <a href={"/set/" + set} className="break-all mb-2 text-2xl font-bold tracking-tight text-gray-900">{set}</a>
                <button onClick={() => del(set)} className="absolute top-0 right-0 invisible group-hover:visible">&#10060;</button>
              </div>
            ))}
          </div>
        </div>
        </>
      )
  }