# ぼくが<br>最近Javaを触っていない<br>３つの理由
JJUG CCC 2016 Spring

いわたん @iwata_n

[イベントページ](https://jjug.doorkeeper.jp/events/43045)

---

# 自己紹介
<img src="https://pbs.twimg.com/profile_images/647965902051241984/ljVIO0fB.png"
     height=10%
     width=10%/>

いわたん

Twitter @iwata_n

組込系企業で組込以外のソフトを書いてる

Like:Node.js / React.js / Python / C / IoT / Vi


---

# その１. Vimで作業しにくい

--

みんなお気に入りエディタがあると思うんだけど

<img src="https://upload.wikimedia.org/wikipedia/commons/9/9f/Vimlogo.svg"
     width=200
     height=200/>
<img src="https://upload.wikimedia.org/wikipedia/commons/0/08/EmacsIcon.svg"
     width=200
     height=200/>
<img src="https://pbs.twimg.com/profile_images/719083046373187584/7TZK1gqH.jpg"
     width=200
     height=200/>
<img src="https://upload.wikimedia.org/wikipedia/commons/c/cf/Eclipse-SVG.svg"
     width=200
     height=200/>
<img src="https://gitlab.com/uploads/project/avatar/1100356/intellij_idea_logo_400x400.pn"
     width=200
     height=200/>

--

## 自分はVim派

![vim](https://upload.wikimedia.org/wikipedia/commons/9/9f/Vimlogo.svg)

--

VimでJavaは一応プラグインとかである程度は対応はできるけど…

- <p class="fragment">import文多いし覚えきれない</p>
- <p class="fragment">プラグインで環境を汚したくない</p>
- <p class="fragment">Java用に色々探してセットアップめんどくさい</p>

--

## じゃぁ、All in oneでIDEだ！

--

でも、IDEのViモードは微妙

- <p class="fragment">IntelliJ自体は最高だけど・・・</p>
- <p class="fragment">ノーマルモードに戻った時にIME OFFにできない</p>
- <p class="fragment">挙動にviとちょっと違う時がある(tabnewとか)</p>

---

# その２. 組込機器で使いにくい

--

こういうのじゃなくて

![Blu-ray](https://upload.wikimedia.org/wikipedia/commons/8/82/Toshiba_BDX_2250_Wi-Fi_Blu-ray_Disc_Player.jpg)

--

こういうの

<img src="https://i.ytimg.com/vi/AcD6qHlhXaM/maxresdefault.jpg" height=350/>
<img src="https://upload.wikimedia.org/wikipedia/commons/2/25/Micromouse_Green_Giant_V1.3.jpg" height=350/>


--

## JavaだとIOポートを制御するのが面倒
みんな大好きRaspberry Piだと[Pi4J](http://pi4j.com/example/control.html)というのがある

```
import com.pi4j.io.gpio.GpioController;
import com.pi4j.io.gpio.GpioFactory;
import com.pi4j.io.gpio.GpioPinDigitalOutput;
import com.pi4j.io.gpio.PinState;
import com.pi4j.io.gpio.RaspiPin;

public class ControlGpioExample {

    public static void main(String[] args) throws InterruptedException {

        System.out.println("<--Pi4J--> GPIO Control Example ... started.");

        // create gpio controller
        final GpioController gpio = GpioFactory.getInstance();

        // provision gpio pin #01 as an output pin and turn on
        final GpioPinDigitalOutput pin = gpio.provisionDigitalOutputPin(RaspiPin.GPIO_01, "MyLED", PinState.HIGH);

        // set shutdown state for this pin
        pin.setShutdownOptions(true, PinState.LOW);

        System.out.println("--> GPIO state should be: ON");

        Thread.sleep(5000);

        // turn off gpio pin #01
        pin.low();
        System.out.println("--> GPIO state should be: OFF");

        Thread.sleep(5000);

        // toggle the current state of gpio pin #01 (should turn on)
        pin.toggle();
        System.out.println("--> GPIO state should be: ON");

        Thread.sleep(5000);

        // toggle the current state of gpio pin #01  (should turn off)
        pin.toggle();
        System.out.println("--> GPIO state should be: OFF");

        Thread.sleep(5000);

        // turn on gpio pin #01 for 1 second and then off
        System.out.println("--> GPIO state should be: ON for only 1 second");
        pin.pulse(1000, true); // set second argument to 'true' use a blocking call

        // stop all GPIO activity/threads by shutting down the GPIO controller
        // (this method will forcefully shutdown all GPIO monitoring threads and scheduled tasks)
        gpio.shutdown();
    }
}
```

--

- コード長い
- ササッと作るにはコンパイルしてどうのこうはめんどう
- 大きなシステム製品にはいいかも

--

ササッと作りたい時ならNode.js+Johnny fiveとかで制御できる

```
const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
  io: new Raspi()
});

board.on("ready", () => {
  const led = new five.Led("P1-13");
  led.blink();
});
```

--

## ちょっとお仕事目線で考えると

- 現場はマイコンにCで書けばいいんじゃね？派が多い
 - レジスタとか扱いやすいし
 - Javaはリアルタイム処理難しそう
- GUI側にJavaを使ってるシステムはある
 - でも最近はC#の方が多い気がする
- モダンな環境だとMatlab/SimulinkでCコードを生成してる
- 多分Java対応よりもC++対応のほうが喜ばれる世界

---

# その３. オシャレなGUIフレームワーク無いの？

--

## 業務用のアプリケーションみたいなUI

![gui](http://i.stack.imgur.com/ZjYsC.png)

--

- もっと簡単にオシャレなUI作りたい
- Material DesignとかMetroUIとかフラットデザインとか
- キラキラした世界を簡単に作りたい

--

![Bootstrap](https://upload.wikimedia.org/wikipedia/commons/6/66/Twitter_Bootstrap_Under_Firefox_32.png)

--

![MaterialDesign](http://www.responsivemiracle.com/wp-content/uploads/con-html5-responsive-theme-desktop-full.jpg)

---

# まとめ

- <p class="fragment">Viからいい加減IntelliJとかAtomに移行しようかな</p>
- <p class="fragment">30億のデバイスで動くのもいいけど、目の前の基板でサクッと動いてほしい</p>
- <p class="fragment">GUIかっこ良いフレームワーク教えて下さい</p>

---

# ご清聴ありがとうございました
いわたん

Twitter @iwata_n
