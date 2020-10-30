export class UI {
    public static showMessage(msg: string, x: number, y: number) {
        const msgbox = document.getElementById("msgbox");
        msgbox.style.top = y + "px";
        msgbox.style.left = x + "px";
        msgbox.style.display = "block";

        msgbox.innerHTML = msg;
    }

    public static async wait(seconds: number) {
        await new Promise(r => setTimeout(r, seconds * 1000));
    }
}