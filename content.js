const app = {
    markdowns: [],
    button_divs: [],
    interval: null,
    originals: {},
    lang_from: 'en',
    lang_to: 'uz',
    current_link: '',
    button_classes: 'flex ml-auto gap-2 rounded-md p-1 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 disabled:dark:hover:text-gray-400',
    button_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">\n' +
        '  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="15">{{lang}}</text>\n' +
        '</svg>',
    init() {
        this.markdowns = this.getMarkdowns()
        this.button_divs = this.getButtonDivs()

        this.interval = setInterval(() => {
            this.button_divs = this.getButtonDivs()
            this.insertIcons()

            if (this.current_link !== document.location.href){
                this.current_link = document.location.href
                this.originals = {}
            }

        }, 1000)
    },
    getMarkdowns() {
        return document.getElementsByClassName('markdown')
    },
    getButtonDivs() {
        let divs = document.getElementsByClassName('text-gray-400 flex self-end lg:self-center justify-center mt-2 gap-2 md:gap-3 lg:gap-1 lg:absolute lg:top-0 lg:translate-x-full lg:right-0 lg:mt-0 lg:pl-2 visible')
        let right_divs = []
        for (let i = 1; i < divs.length; i += 2) {
            right_divs.push(divs[i])
        }
        return right_divs
    },
    insertIcons() {
        for (let i = 0; i < this.button_divs.length; i++) {
            let btn = document.createElement('button')
            let parsed_classes = this.button_classes.toString().split(' ')
            for (let j = 0; j < parsed_classes.length; j++) {
                btn.classList.add(parsed_classes[j])
            }
            btn.innerHTML = this.button_icon.replace('{{lang}}', this.lang_to.toUpperCase())
            btn.onclick = () => {
                this.clicked(i)
            }
            if (this.button_divs[i].childNodes.length <= 2) {
                this.button_divs[i].insertBefore(btn, this.button_divs[i].firstChild)
            }
        }
    },
    showOriginal(num) {
      this.markdowns[num].innerHTML = this.originals[num]
    },
    clicked(num) {
        let children = this.markdowns[num].childNodes;
        this.originals[num] = this.markdowns[num].innerHTML
        for (let i = 0; i < children.length; i++) {
            if (children[i].tagName === 'PRE' || children[i].tagName === 'CODE') continue;

            this.translateText(this.lang_from, this.lang_to, children[i].innerHTML).then(json => {
                children[i].innerHTML = this.getSentencesFromJSON(json)
                //change uz button to en
                let btn = this.button_divs[num].firstChild
                btn.innerHTML = this.button_icon.replace('{{lang}}', this.lang_from.toUpperCase())
                btn.onclick = () => {
                    this.showOriginal(num)
                    btn.innerHTML = this.button_icon.replace('{{lang}}', this.lang_to.toUpperCase())
                    btn.onclick = () => {
                        this.clicked(num)
                    }
                }
            })
        }
    },
    async translateText(source, target, text) {
        const url = "https://translate.googleapis.com/translate_a/single?client=gtx&dt=t";

        const fields = {
            'sl': encodeURIComponent(source),
            'tl': encodeURIComponent(target),
            'q': encodeURIComponent(text)
        };

        let fieldsString = "";
        for (let key in fields) {
            fieldsString += `&${key}=${fields[key]}`;
        }

        fieldsString = fieldsString.slice(1); // Remove the leading '&'

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: fieldsString
        };

        return fetch(url, requestOptions)
            .then(response => response.text());
    },
    getSentencesFromJSON(json) {
        const sentencesArray = JSON.parse(json);
        let sentences = "";

        if (!sentencesArray || !sentencesArray[0]) {
            throw new Error("Google detected unusual traffic from your computer network, try again later (2 - 48 hours)");
        }

        for (let s of sentencesArray[0]) {
            sentences += s[0] ? s[0] : '';
        }

        return sentences;
    }
}

app.init()


chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(request)
        if( request.message === "start" ) {
            app.init()
        }
    }
);