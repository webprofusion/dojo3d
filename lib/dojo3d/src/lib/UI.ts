export class Answer {

    constructor(public answer, public optionNumber) {
        this.toString = (): string => {
            return this.answer;
        }
    }

}

export class UI {

    public static showMessage(msg: string, x: number = 10, y: number = 10) {
        let msgbox = document.getElementById("msgbox");

        if (!msgbox) {
            const msgDiv = document.createElement("div");
            msgDiv.id = "msgbox";
            document.children[0].appendChild(msgDiv);
            msgbox = document.getElementById("msgbox");
        }

        msgbox.style.top = y + "%";
        msgbox.style.left = x + "%";
        msgbox.style.display = "block";

        msgbox.innerHTML = msg;

        return msgbox;
    }

    public static hideMessage() {
        let msgbox = document.getElementById("msgbox");
        if (msgbox) {
            msgbox.style.display = "none";
        }
    }

    public static async ask(question: string, options: string[], x: number = 10, y: number = 10): Promise<Answer> {
        let msgbox = this.showMessage(question, x, y);

        return await new Promise(resolve => {
            const ul = document.createElement("ul");

            for (const o of options) {
                let li = document.createElement("li");

                let a = document.createElement("a");
                a.href = "#";
                a.innerHTML = o;

                a.addEventListener('click', () => {
                    let optionIndex = options.indexOf(o) + 1;
                    this.log(`You clicked option ${optionIndex}: ${o}`)
                    resolve(new Answer(o, optionIndex));
                });

                li.appendChild(a);
                ul.appendChild(li);

            }

            msgbox.appendChild(ul);
        });
    }

    public static async wait(seconds: number) {
        await new Promise(r => setTimeout(r, seconds * 1000));
    }


    public static log(msg: string) {
        console.log(msg);
    }

    public static speak(message: string, voice: number = 0) {

        this.log("Saying:" + message);

        const msg = new SpeechSynthesisUtterance(message);
        var voices = window.speechSynthesis.getVoices()
        msg.voice = voices[voice]

        window.speechSynthesis.speak(msg)
    }
}