export default function ClassChoice({}) {

    // only 1 POS button active at a time
    


    return (
        <>
            <div>
                <input list="class-values" id="class-name" />
                <datalist id="class-values">
                    <option value="Person" />
                    <option value="Cat" />
                    <option value="Dog" />
                </datalist>
            </div>
            
            <label for="num">Enter Quantity:</label>
            <input type="text" id="num" value={">0"}></input>

            <button>POS</button>
        
        </>
    )

}