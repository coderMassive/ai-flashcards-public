'use client'

import { useState } from 'react'
import { doc, setDoc } from "firebase/firestore"; 
import { useUser } from '@clerk/clerk-react';
import db from '../firebase';

export default function Home() {
    const [text, setText] = useState('')
    const [flashcards, setFlashcards] = useState([])
    const [setName, setSetName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const handleOpenDialog = () => setDialogOpen(true)
    const handleCloseDialog = () => setDialogOpen(false)

    const [buttonText, setButtonText] = useState("GENERATE FLASHCARDS");
    const changeText = (text) => setButtonText(text);

    const { user } = useUser()

    const handleSubmit = async () => {
        if (!text.trim()) {
            alert('Please enter some text to generate flashcards.')
            return
        }

        try {
            console.log('Loading flashcards');
            changeText("Loading...");
            const response = await fetch('/api/generate', {
              method: 'POST',
              body: text,
            })

            if (!response.ok) {
              throw new Error('Failed to generate flashcards')
            }

            const data = await response.json()
            setFlashcards(data)
            console.log('Done loading flashcards');
            console.log(flashcards);
            changeText("GENERATE FLASHCARDS");
        } catch (error) {
            console.error('Error generating flashcards:', error)
            alert('An error occurred while generating flashcards. Please try again.')
        } 
    }

    const saveFlashcards = async () => {
       if (!setName.trim()) {
        alert("Please enter a title");
       };
       await setDoc(doc(db, "/users/" + user.id + "/sets/" + setName), {
        cards: flashcards
       });
       handleCloseDialog();
       setSetName('');
    }

    return (
      <div className="md:container md:mx-auto">
        <div className="my-4">
          <label className="mb-3 text-lg md:text-xl">Generate Flashcards</label>
          <textarea
          variant="outlined"
          resize="true"
          rows={4}
          onChange={(e) => setText(e.target.value)}
          className="block mb-3 h-36 w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500"
          id="text"
          placeholder="Enter text here">
          </textarea>
          <button onClick={handleSubmit}
          id="button"
          className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">
            {buttonText}
          </button>
        </div>
        


        {flashcards.length > 0 && (
          <div className="md:container md:mx-auto">
            {/* <label className="mb-3 text-base md:text-lg">Generated Flashcards</label> */}
            <div className="grid grid-cols-4 gap-2">
              {flashcards.map((flashcard, index) => (
                <div className="max-w-full p-6 bg-white border border-gray-200 rounded-lg shadow" key={index}>
                  <p className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Front:</p>
                  <p className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{flashcard.front}</p>
                  <p className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Back:</p>
                  <p className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{flashcard.back}</p>
                </div>
              ))}
            </div>
            <button onClick={handleOpenDialog} className="mt-3 bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">SAVE</button>
          </div>
        )}

        
        {dialogOpen && (
          <div id="dialog" className="fixed left-0 top-0 w-screen h-screen">
              <div className="bg-gray-500 rounded shadow-md p-8 mx-auto my-20 w-1/4">
                  <div className="flex items-center gap-5">
                      <div>
                          <h1 className="font-bold text-lg mb-2">Save Flashcard Set</h1>
                          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Please enter a name for your flashcard set.</label>
                          <input value={setName} onChange={(e) => setSetName(e.target.value)} type="text" id="default-input" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
                      </div>
                  </div>
                  <div className="flex items-center gap-5 mt-3">
                      <button onClick={saveFlashcards} className="bg-green-500 px-6 py-2 rounded text-white hover:bg-green-600">Save</button>
                      <button className="bg-gray-100 border border-gray-300 px-6 py-2 rounded text-black hover:bg-gray-200" onClick={handleCloseDialog}>Cancel</button>
                  </div>
              </div>
          </div>
        
        )}
        </div>
    )
          }

