const Api =(()=>{
    const url = 'https://random-word-api.herokuapp.com/word';
    const getData = () => fetch(url).then((res) => {return res.json()}).catch(
        () => {
            const wordList = [
                "ballot",
                "soil",
                "legislation",
                "valley",
                "country",
                "nail",
                "piano",
                "speech",
                "efflux",
                "reason",
                "alcohol",
                "stable",
                "slice",
                "situation",
                "profession",
                "restaurant",
                "pocket",
                "satisfaction",
                "condition",
                "comfortable"
            ]

            return [wordList[Math.floor(Math.random() * wordList.length)]];
        }
    ); 

    return {
        getData     // Promise
    }
})();



const View = (()=>{
    let domSelector = {
        inputBox: "#user-input",
        word_display:".word-display",
        btn:"#newGameButton",
        lose_count:"#lose-count",
        user_input_store: ".userInputArea",
        timer: ".timer"

        
    }
    
    const creatTmp = (word,map)=>{
        let template = '';
        for (let i=0;i<word.length;i++){
            letter= word[i]
            if (map[i]){
                //hidden
                template+=`<span class="underscore${i}">_</span>
                <span class="hidden" id="l${i}">${letter}</span>`
            }else{
                template+= `<span>${letter}</span>`
            }
        }
        
        return template;
    }

    const createinputspan = (letter, yesOrno) => {
        
        template = ''
           
        if (yesOrno) {
            template += `<span style="color: blue;" class = "inputStoreLetter">${letter}</span>`
        }
        else {
            template += `<span style="color: red;" class = "inputStoreLetter">${letter}</span>`
        }
        
        return template;
    }
    
    const render = (ele, template)=>{
        ele.innerHTML = template;
    }

    return {
        domSelector,
        creatTmp,
        render,
        createinputspan
    }
})();

  

const Model = ((api, view)=>{
    const { domSelector, creatTmp, render } = view;
    const { getData } = api;

    class State{
        constructor(){
            this._map = {}
            this._newlist = []
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

        // create a list to store the useriput data for showing at the user input store selection
        set setnewlist(letter) {
            this._newlist.push(letter)
            return this._newlist
        }

        get getnewlist() {
            return this._newlist
        }

        newletterLoopUp(letter) {
            for (let i = 0; i <= this._newlist.length; i++) {
                console.log(this._newlist[i] == letter)
                if (this._newlist[i] == letter) {
                    return true
                }
                else {
                    
                }
            }
            return false
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
            //console.log(tmp)
            render(word_display_container, tmp);
            return this._map
           
        }
        reset(){
            this._map={}
            this._reverse_map={}
            this._newlist = []
        }
    }

    return {
        State,
        getData
    }
})(Api, View);



const Controller = ((view, model)=>{
    const { domSelector, createinputspan } = view;
    const { State, getData } = model;

    const state = new State();
    const init = () => {
        getData().then((data) => {
            console.log(data[0])
            state.setHiddenMap=data[0];
            // reverse map is depending on hidden map. Don't
            // change their sequence!
            state.setReverseMap=data[0];
        });

        setInterval( () => {
            alert(" 60s Times Up")
            newGame()
        } , 60000)

        setInterval(function() {
            document.querySelector(domSelector.timer).innerHTML--
            }, 1000)
    }

    // Add event listeners
    const guessLetter = () => {
        const userInput = document.querySelector(domSelector.inputBox);
        const btn = document.querySelector(domSelector.btn);
        const lose_count = document.querySelector(domSelector.lose_count);
        const userInputStore = document.querySelector(domSelector.user_input_store);
        
        btn.addEventListener('click', ()=>{
            newGame()
        })

        userInput.addEventListener('keypress', (event)=>{
            if (event.keyCode==13){
                input_letter = userInput.value;
                if (input_letter.length>1){
                    alert("you can't type more than one letter at once")
                }

                if (state.newletterLoopUp(input_letter)) {
                    alert("You already guessed this letter, try a different letter")
                    userInput.value=""
                    return                   
                }
                else {
                    //add the input value to the input store area
                    state.setnewlist = input_letter
                }
                        
                
                //check it's correct or not
                if (state.getReverseMap[input_letter]){
                    // if correct
                    //display logic
                    //bonus: when correct display blue when wrong display red
                    // userInputStore.style.color = 'blue'
                    userInputStore.innerHTML+= createinputspan(input_letter,true)

                    index_to_display = state.getReverseMap[input_letter]
                    for (let i=0;i<index_to_display.length;i++){
                        let target_reveal = "#l"+index_to_display[i]
                        document.querySelector(target_reveal).classList.remove("hidden")
                        let target_hide = ".underscore"+index_to_display[i]
                        // hide the underscore
                        document.querySelector(target_hide).classList.add("hidden")
                    }

                    delete state.getReverseMap[input_letter]
                    
                    if (Object.keys(state.getReverseMap).length==0){
                        newWord(state)
                        userInputStore.innerHTML = []
                    }
                }else{
                    //incorrect logic
                    // userInputStore.style.color = 'red'
                    userInputStore.innerHTML+= createinputspan(input_letter,false)
                    
                    // if the wrong input letter is inside the input store then dont count
                    lose_count.innerHTML++

                    // console.log(state.getnewlist)
                    // console.log(state.newletterLoopUp(letter))
                    // if (state.newletterLoopUp(letter)) {
                        
                    // }
                    // else {
                    //     lose_count.innerHTML++
                    // }

                    //If the wrong count > 10 then alert
                    if (lose_count.innerHTML>10){
                        alert("Game over! You have guessed 10 words!")
                        lose_count.innerHTML = 0 
                        newWord(state)
                        userInputStore.innerHTML = []
                    }
                    //todo: start new game
                }

                userInput.value="";
                
            }


            
        })
    }

    newGame = () => {
        window.location.reload()
    }
    newWord = (state) =>{
        state.reset()
        
        getData().then((data) => {
            console.log(data[0])
            state.setHiddenMap=data[0];
            state.setReverseMap=data[0];
        });
    }

    // wrap all function, initial the game
    const bootstrap = ()=>{
        init();
        guessLetter();
    }

    return {
        bootstrap,
    }
    
})(View, Model);

Controller.bootstrap();