import { useState } from "react"
import ClassChoice from "./ClassChoice";

export default function SelectPanel({}) {
    const [currentChoice, setCurrentChoice] = useState();
    
    // add, remove button to add class choice
    

    // SelectPanel just needs to track what class is being chosen to draw
    return (

        <>
            <ClassChoice></ClassChoice>        
        </>

    )

}