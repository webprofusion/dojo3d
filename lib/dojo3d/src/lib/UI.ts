export class UI {
    public static showMessage(msg: string, x: number, y: number) {
        let msgbox = document.getElementById("msgbox");

        if (!msgbox) {
            const msgDiv = document.createElement("div");
            msgDiv.id = "msgbox";
            document.children[0].appendChild(msgDiv);
            msgbox = document.getElementById("msgbox");
        }

        msgbox.style.top = y + "px";
        msgbox.style.left = x + "px";
        msgbox.style.display = "block";

        msgbox.innerHTML = msg;
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