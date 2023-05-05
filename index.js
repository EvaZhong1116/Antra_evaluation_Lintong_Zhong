const Api =(()=>{
    const url = 'https://random-word-api.herokuapp.com/word';
    const getData = fetch(url).then((res) => {return res.json()}).catch(); 

    return {
        getData     // Promise
    }
})();



const View = (()=>{
    let domSelector = {
        inputBox: "#user-input",
        word_display:".word-display",
        btn:"#newGameButton",
        lose_count:"#lose-count"
    }
    
    const creatTmp = (word,map)=>{
        let template = '';
        for (let i=0;i<word.length;i++){
            letter= word[i]
            if (map[i]){
                //hidden
                template+=`<span class="underscore${i}">_</span><span class="hidden" id="l${i}">${letter}</span>`
            }else{
                template+= `<span>${letter}</span>`
            }
        }
        
        return template;
    }
    
    const render = (ele, template)=>{
        ele.innerHTML = template;
    }

    return {
        domSelector,
        creatTmp,
        render
    }
})();


const Model = ((api, view)=>{
    const { domSelector, creatTmp, render } = view;
    const { getData } = api;

    class State{
        constructor(){
            this._map = {}
            this._reverse_map = {}
        }

        get getHiddenMap(){
            return this._map;
        }
        get getReverseMap(){
            return this._reverse_map;
        }
        set setReverseMap(word){
            let letter =""
            for (let i=0;i<word.length;i++){
                if (this._map[i]){
                    // this ensure the letter we processed is hidden only.
                    letter = word[i]
                if (this._reverse_map[letter]){
                    this._reverse_map[letter].push(i)
                }else{
                    this._reverse_map[letter]=[i]
                }
                }
                
            }
            return this._reverse_map;
        } 
        // key of the map is the position that will be hidden
        // value of the map is the letter that will be hidden
        set setHiddenMap(word){
            //number of the hidden letters
            let num_hidden = Math.floor(Math.random() * word.length)
            if (num_hidden==0){
                num_hidden=1
            }
            console.log("num_hidden"+num_hidden)
            // position of the hidden letters
            for (let i=0;i<num_hidden;i++){
                let position=0
                do {
                position = Math.floor(Math.random() * word.length)
                }while (this._map[position])
                this._map[position] = word[position]
            }
            let word_display_container = document.querySelector(domSelector.word_display)
            let tmp = creatTmp(word,this._map);
            console.log(tmp)
            render(word_display_container, tmp);
            return this._map
           
        }
    }

    return {
        State,
        getData
    }
})(Api, View);

const Controller = ((view, model)=>{
    const { domSelector } = view;
    const { State, getData } = model;

    const state = new State();
    const init = () => {
        getData.then((data) => {
            console.log(data[0])
            state.setHiddenMap=data[0];
            // reverse map is depending on hidden map. Don't
            // change their sequence!
            state.setReverseMap=data[0];
        });
    }

    // Add event listeners
    const guessLetter = () => {
        const userInput = document.querySelector(domSelector.inputBox);
        const btn = document.querySelector(domSelector.btn);
        const lose_count = document.querySelector(domSelector.lose_count);
        
        btn.addEventListener('click', ()=>{
            newGame()
        })

        userInput.addEventListener('keypress', (event)=>{
            if (event.keyCode==13){
                if (userInput.value.length>1){
                    alert("you can't type more than one letter at once")
                }
                input_letter = userInput.value;
                //check it's correct or not
                if (state.getReverseMap[input_letter]){
                    //correct
                    //display logic
                    index_to_display = state.getReverseMap[input_letter]
                    for (let i=0;i<index_to_display.length;i++){
                        let target_reveal = "#l"+index_to_display[i]
                        document.querySelector(target_reveal).classList.remove("hidden")
                        let target_hide = ".underscore"+index_to_display[i]
                        console.log(document.querySelector(target_hide))
                        document.querySelector(target_hide).classList.add("hidden")
                    }
                    delete state.getReverseMap[input_letter]
                    console.log(state.getReverseMap)
                    if (Object.keys(state.getReverseMap).length==0){
                        newGame()
                    }
                }else{
                    //incorrect
                    lose_count.innerHTML++
                    if (lose_count.innerHTML>10){
                        alert("Game over! You have guessed 10 words!")
                        lose_count.innerHTML = 0 
                    }
                    //todo: start new game
                }


                // let item = {
                //     title: userInput.value,
                //     id: Math.floor(Math.random()*100) + 200
                // };
                // const newList = [item, ...state.getTodoList];
                // state.newTodoList = newList;
                // console.log(newList)
                userInput.value="";
            }
            
        })
    }

    newGame = () => {
        window.location.reload()
    }

    // wrap all function
    const bootstrap = ()=>{
        init();
        guessLetter();
    }

    return {
        bootstrap,
    }
    
})(View, Model);

Controller.bootstrap();