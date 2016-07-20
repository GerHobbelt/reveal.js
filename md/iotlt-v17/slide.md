# WioNodeでMoTはじめました
## ～すべてがMになる～
IoT縛りの勉強会! IoTLT vol.17 @ ヤフー

いわたん @iwata_n

[イベントページ](http://iotlt.connpass.com/event/32233/)

---
# 自己紹介
<img src="https://pbs.twimg.com/profile_images/647965902051241984/ljVIO0fB.png"
     height=8%
     width=8%/>

Twitter @iwata_n

高専の機械科卒業です。7月で組込の会社辞めて8月からWeb系です

森博嗣の小説を読み漁ってます

最近[ドットスタジオ](https://dotstud.io/)で外部ライターしてます

Like:Node.js / React.js / Python / C / IoT / Vi / Beer

---

GR-COTTONでシリアル通信が始まると電源が入らない問題

Teratailで質問したらTwitterで公式アカウントから回答来た

はやく、mrubyとかNode.jsとかで使ってみたいなーﾁﾗﾁﾗ(/ω・＼)

---
# 仮想現実は、<br>いずれただの現実になります
『すべてがFになる（森博嗣著）』の登場人物、真賀田四季のセリフ

--
## VR
<p class="fragment">
VR、うんVR。面白いよ。<br>
うーん、でも俺、乱視だし上手く見えない時あるんだよなぁ
</p>
<p class="fragment">
しかも今日は **IoT** の場だし。
</p>
--
## IoTで仮想現実をただの現実にしてみよう

---
## 仮想現実
<p class="fragment">
![https://minecraft.net/static/pages/img/header-banner1.33f7482083dc.jpg](https://minecraft.net/static/pages/img/header-banner1.33f7482083dc.jpg)
</p>

--

## みんな大好きMinecraft

--
## ただの現実
<p class="fragment">
<img src="wionode.png" height=450 />
</p>

--
## ぼくが大好きWioNode
詳しくは[LIGブログ](http://liginc.co.jp/290031)参照

--
## ふたつを組み合わせて何ができる？
- 仮想現実で起きた事が現実にも起きる
- 現実で起きた事が仮想現実でも起きる

--
# Minecraft of Things!

---
# とういうことで早速デモ

--
<iframe src="demo.html" height=600 width=100%></iframe>

---
# 仕組み

<img src="struct.png" height=450 />

--
## WioNode
- スマホで設定が可能
- REST APIが生成されるのでHTTPSでアクセス

--
## Minecraft
- Minecraft ForgeというMOD開発環境
 - Java
 - 資料がなさ過ぎて難しい・・・
- レッドストーン回路の入出力でWioNodeでアクセス
 - 現実→仮想現実の流れは今回諦めた

---
# 作り方
時間があれば

--
## WioNode
スマホだけで設定可能です。

設定を行うとモジュールごとにRest APIが発行されます。

詳しい設定方法は[LIGブログの記事](http://liginc.co.jp/290031)参照

--
## Minecraft
ほとんどMODの開発です。

--
### Minecraft Forgeの開発キットをダウンロード
[公式サイト](http://files.minecraftforge.net/)より開発キット（MDK）をダウンロードします。
今回は2016年7月現在で最新の1.10.2を使用します。

<img src="https://lh3.googleusercontent.com/bTis8LoxaFXhl4zmm2cSy7nNAfcQ4grV-OrAqXjPi3zjw1uza3KbeaAoNSDjnXJ6JxjMznr65iP0I2VoV5UHDyh7RG-d_0AL9-vTpiLV5I5W_hZDmsk8e09QNNPoHuTswB1kquBU_KrtIshea760k4DYGqXGuSHdDBX5JOo0GmcsMKUMDPF0HFRXa_p3Vm6nQvOK0SYQ4sUZD28y1hTIsdrW2tR977plT2cW6CGq91DzWQ0GGm2KyD2cEOYQfQHRh6qNiTO2LKukP7uBtwlDA31Uvk9keU4DQIGTVu48vOZJ65opLDIyrIayFGq0G6Tl1tZ_nLNR1PBsN2xHwO4huKRqNFVNxIheFT-nIGDUAblo4cLfww6-coXOrL_ImcaItAxOmZhHEmQGxFFfLzETrO5F3scDHQp1rx09ogeOlAdm5Tpss2I9p8LLe6c7h1O_gSVnLiug0k3Wm9zRttB54H7skheC7uJWSJSUhqEcGWpCo7uEtJ4x002txPcHOvtF_eXxo9MB5JI7DPpHM-BYRdCVjG99OMJn28OyRNOo5taVIm3rYWtK5_trVaLlpccUiPonvl_6eevrMfcjG9zDfqBtp-E3XdcJ=w1984-h924-no"  height=450/>

--
ダウンロードしたMDKを解凍します。

<img src="https://lh3.googleusercontent.com/k61ytYKw9QP1vlbIsz3Ftj7187hbboK5y-zEwMLavpRQ4gbFnN_BLrs9EaMqCBbHaSz7IkAZeC0DGYIf3Gk5Qc0Ia89qpweNrSu7nXWWDNBPBvZjLrJ_qgL-MgcJ2TshWWzxZPCLTwBNBiYli_CpVWnDCEcj1tXu1fPJc6dOZBGw7fa8NN572DxUPDV0nc2V4FbMrokEnCh5vlE5uSUz3GFrJ6MDzbP9RNUnnIi5p_qp-ZsTCtI9KjMBjAuFjM3QAypPOFw5Fpe5Ovda31D-vl1g5vsULcJqBJfNZC5FIJ87_zmGy24fG9bl8yp0w2y576VKXPdiidDn5vcjC_ib7FAKi3w4DVOg0yShxbIl5X4CfgwixqN8pumUEZ76Vb_L4nBuPuc5Wf6I5j6PZvelEOb8xF6BMjxYTCPmFXKdV8rytmUQrVNkFAXvCruSPkMLuPIAw2DkI2-y_8Q0MLNioFUnLHrdGSH3B5S1pY2-WESH2JmRG38b4f3VOCJ9p-8j92qtgJVlJWvX-FadJhHiPj9uEsGC5zSS6IYscJpPqJ0jzTWZWqGvkGvDgnDwu0G8m62FOfr2ORpxVB9u6EjjrThCzdVghbbd=w1660-h1150-no" height=450 />

--
### IntelliJで開く
まずターミナル等で以下のコマンドを実行します。OSに合った、コマンドを実行してください。

windowsの場合は以下です。

```
gradlew setupDecompWorkspace
```


Linux/Mac OSの場合は以下です。

```
./gradlew setupDecompWorkspace
```

--
コマンドが成功したら、IntelliJでプロジェクトをインポートします。

<img src="https://lh3.googleusercontent.com/dxgma1njdCM2QvUEM9a5Qt8bP1FKu3Hso2TMhufFmcWsvVxR6DkhdHXMDEcv6blXzo25XbN8xQE5q_q2-Eg5Ys8LMyrpRQMiaMndusKkmm5tp2Sx0MPOJFtvXCPjnRT8h98wjqBzD_A9hnrfQTH_1CVu9T3YPbkaEls1CAJdvwj8HHtSdHylzfqP0zZfCsHapgP6_4o45ZcJLLReReV67Rd9lqRZDEKxbU3Js22iGz8sS8S9CetFGOKh6BXc8JI0MLoun4bdskYBWN2OpsdPE51mdsD5ZWrsGeksEDmTby4JULU6lKt_oGjV8hEhrITQloOkhbf7NAmIJk6DmzX6pZAhqy1swlRNcJWnrpfWzTbbCcgKyY4aPQKjBBalxGH_bE9ZbAlf_pccz_Q8eVb5qH81aJjo_su_BUPpKRLzlZVURCL1vI4ock5d-rasSSnU9TTy3aMy78u5IVDkLLefPLLzQtyxpnlvcCXxU_oxfUIexP_0bQEGF2BfMxYKMyWnLb3WoVYbnH-tBIP1dr8eAKN5d0Q2EkvRtlOevrxlzMNKcAssUhDrJkCYKpimM1KGQSdEX4Q1wLFVS68N12ATCkdHXkx5xapo=w1556-h1144-no" height=450 />

--
この際に、**gradle.build** を選択するように注意してください。

<img src="https://lh3.googleusercontent.com/e7HSf1o27TnXjFT8EAXjo19Pa6MjPv-LW1efY_fNOvNWgPUzP6TkJVYnph8wS57pI4r0ARN2VIve7Nm3UBKlkxlRAFUPDFb-sMaaJpdhEGhlpV9vyWXJo0O5rrJvJNWzNDYIz2k8bC-_S57msyme8NDa8PMU1kcUzN_CZ2LrzSHHSYU_hWfdYfGY0YX3b5NrMtIRiJ0543afd7x_R7GUGv3PFdslcblmG2niECuQKKKBNvBJ-akJGW1bqDMBPlxbvc5ejeJNnKCaJXLgUhD8GrQK1mA85J15KSxdz7UfcLQTcJBTtih1z414-NNGc3KuoaNU4R13jNP1tGGgeh5nTNuJnOBStmDB0_J9tsjQo-rMxgUXxBwkHKejTGFcCwIi-WyvITLSvFzeDLmz2EgMhcqg4dXP5GbxmS7RPuvwdeppKVuPP0Xvgce2Hg9V5DhU4xf47GGxN_B7NCDcidtoxnFDPgKUMHiq6JSevng1lySBqYMSjFRKFGLWVLuep5K04pHNRNJzD-XZ-7XRFRgYD7NkSUB6GIgjdX1opMSRuYiy9l7RitBphYQ8wDIOxjyfpcuy70H4Cpb70DoO9frXUd22Uq-W5CU4=w1072-h1320-no" height=450 />

--
この画面はOKです。

<img src="https://lh3.googleusercontent.com/B65QuLuTHr21zIOuE5kMkxmefI7rA0rlnv4QjCIh9daQmmyUopqM9Z-FV24-Hc3Zl2HdPXn7yRG0pBKX3ZaskrxgFFfaJ77qy7LsA-Z57DOALubyvnZ2-DRn7D8vlU24_V0pRyOWhfKnzhLG4V7gTXsLRTat2j1QPF7s-zlUWUSDYG3SPUEKtid-o-eDxoIC9FjBzSXVd6ft6kpPqdVo9xIzgf1xqVja23TWTE_6nCkIAR-o1SNOamcDYN_8Cy-HozDuzNuKu6lz1nS1KftGdgZYP5PSUn_LFbwO2_O2JySE2Dm1fES7CFuhX3K3TLrceSI0YXF_XHHE_d9eHpu7THGZTwn0tc5r6i0lCtDFLgp5848FX36-DqIv8eR54xh28x2XM3kbiFxLc5g6FeXZ_hCuH5flWlWL-rZ1_8yMv4EsO_rpqOuxhJXttFSppR-knbsh3RnRpt9GPfWPD0AJXogMcZMocl8jtMqXXIotB4xt29wsd30dSEbSI80MreCSw4EanHY79oG9QiYjttrkb6VrbaygodwUjw9qi0M3UW7k6gQwN0K8n2XwWsb8mS2Essuoq7OxXcu1SY_s2o-G4CJmrThzLclx=w2178-h1516-no" height=450 />

--
インポートが完了したら、ターミナル等で以下のコマンドを実行してください。

windowsの場合は以下です。

```
gradlew genIntellijRuns
```

Linux/Mac OSの場合は以下です。

```
./gradlew genIntellijRuns"
```

--
以下のような出力が出てきたら成功です。

```
~略~
#################################################
         ForgeGradle 2.2-SNAPSHOT-0447b4e
  https://github.com/MinecraftForge/ForgeGradle
#################################################
               Powered by MCP unknown
             http://modcoderpack.com
         by: Searge, ProfMobius, Fesh0r,
         R4wk, ZeuX, IngisKahn, bspkrs
#################################################
:genIntellijRuns

BUILD SUCCESSFUL

Total time: 37.125 secs

This build could be faster, please consider using the Gradle Daemon: https://docs.gradle.org/2.7/userguide/gradle_daemon.html
```

--
そうすると、IntelliJが警告を出すことが有ります。これは、IntelliJ以外でファイルが変更された場合に出てくる警告なので「Yes」を選択します。

<img src="https://lh3.googleusercontent.com/goWj784U5vpcnhifalYLiffu3naKNY-BNzK5XD-7rhPRTZ62MyyT2Iosy0JYgtkT_7jH3GVZzUfu-0DHF0fMSSQbLPrzmcadA-NiE_Pn-wqqlZN91pkWzfh9NlImwNplbhrJWu9Z64eGcG-nnvtYlMjKUewR6sukQmzdN-6ilnrGmrqUsvnj5VYCfCVuF05aWdKkb6Dp_cWmUPEkdbsDIH7Xn2TQAhK5UYiVl_eYBFJ8hCU1_iHd6Otcw4bVG0ELG-Mdb-aBHNpAlrnxO_MpK22AjQMuiK_GOmCVU6OvtgLFrwV7Yv08segRNAwKL9V9B8REuaBulWJBC8iwCVqLSAbanrVBouGaVug8cnIzdklQ2jpbllzZ0TVXUue2570_aMEbSjVnYrfDpXaIQPZkVDJEGRY6hwQkRUIZSXpKd2SWsQcMsQS7hsdgww0VFY5nZ2CCQVkCKaGYj-y87BWrSm1XGjLmVtDkJFnyLn4RH_QSF7nDlv9zvYX-fhyU1VCvmQHDK7wMeE85B_5kYzA142-hwQWtv7KJFnsxRDMh9tp-t085YMY4J6TYj8dtOI4PyeIbyQMinXa-45Tf16VDWyth3kTVrpW7=w888-h576-no" height=450 />

--
ここまでの工程が正常に終了すると、画像のような構成になります。

<img src="https://lh3.googleusercontent.com/oLYNe_I_up-sDHOPo3i4raWsNTX8OoiPN53AvQt9TXg-NIr1sPnsAxvsInar9HUKc-uUTV1yYmI4NvPRpgHXvx8JbcJxEKcTI2j5f5smpWfyQ_Rb0oe7TiUV-Q_xzFZwxJsBCP80iM3zYK3ozmKebXtiQljRDEijxzbtz5Noo6ReQ-XqtPKNg82AOa6QY4t7csjQ_OhFcE_2uSeSC0JofNApOx---FsEqHoJFGTjmT7YusvXWYS1qh568z6MZdmV3WMaoi7_vaHpAci8cEllKGM-Aq8WZhbqznfbaDhPACi8QhJmN_XSf-6lnuWIGMq4rrv4ID0bVKarnCkB_Iax9nfT2FgqAbdMh8tdk745zwycCT8PN4Ev5U4aEv_u9khXDf7EDblXwxtTAt0iOTDYsHc3qk3le9Zs8BVRpO53Dqno04vY7AVFQm000egy5emp5jO51NyRGFPPdJMXHK1_Tiq-Swb_rQodv3ZxBzJxMfVM7azPU_D9J-FLZ5jnWYIC0u7PFEBRR2EnurMt0Mzaq4MQhZ_yu4K8iEOQzZXQhArDSgh7HlW3EkJPfU0BtNtUduLbOXNp2hhtantaH7NOaigMXIQA8Fq2=w2566-h1864-no" height=450 />

--
右上の実行構成を選ぶコンボボックスから「Minecraft Client」を選択し、実行ボタンを押します。

<img src="https://lh3.googleusercontent.com/sNgP1POLpaN58xEhbOs0cVatMhj33reJ_UETUsZjHBcrQu7wAv2zR2aMb5qd1xlj9CYC2QcffnelUTttnHUCET4n3tFOFeIPGpqY3pN25z7F0C0H1ryH50EYlDZqUqEIk6CEJRNRREU4ZNVjD3NiP4oOQsDZ-WEKjc85e6S_WeeAiwpPkPu8sbH-BukoJ7QI_3dUWp-S-b42hhvkXLBJRcJZAlzrewMfBNjkRkoKWorcvQTIdaGqGwT1Cf6x8-4bkudVLU19E-4HE78Z7aZ_jF9fB4hxM798qSYgiF8clIW7BbKckS61RZqbaAoRUz8cWJWwgrZY37LXWT63r_7WR2vKgQU3Vtqz96tsv8nAdk9adECJI32Dgxry2eog8BDy_sj06nsQjVVE6DOC_YwdFzYuF0Apz2sMS2zctpjUmWyW7oc8mqJrzVBMzxFBKQn6dbsaCR-kv7jPLv9A4i8TrwTUF67NAyiHlPz-wnjePN10oFrsgRI1wtlqzc6AkdvvJm0R_yW6zlCilBkPTkk9IVqakEwy7Cc73_hO0BL2sauyFlkGRzk0UDukZSXOoD8vs0WKc1vjqFog0dlvVerZBjAoi741GP3v=w664-h230-no" height=450 />

--
この時、画像のようなエラーが出た場合、「Edit Configurations...」を押してClasspathの設定を行う必要があります。

<img src="https://lh3.googleusercontent.com/VtdbbPOX-FKnuo2S2k-fRPgmAuoP3n0W3Hhg2PN_AC7QONC7Rvf2CCIKp_cA0DQueTqrwOTnytCDd618U53EiOYBdvG3b4bvVlPr2iREA2kjndhzBAJEsv318cwGJ_llL2LVFi2zUp9OgVmuanxXvrBdu67fxnHHxgmeIgSi4Cu9PtD5Rc0CwoHKXcH0--T4wwvEuiQx3-zGkWKkPxpZtaCJJOqbu_R3sh7uAY6lJfJAC94V6so0lc362sovNuYADiwrDtUPFE0_6e6P5bAj8k0IgXCTe-Dovk2R_rI0bjZ91MVz2i2w0zXRYBi-P1zzSMVrN282PTZbBM6gGrgBXMqnaP7DtFNuHX2BaabBg1-aWr61Or1gBPHVP-xYJ8AkrUsUKqQxJ3mBSDN2kUHySps1pDx2fUxUol-VrNdHwt8AdHu4QjQdwxMLGSkiGP0fomLEDA495w-FqkQXhaJRpJai9-Dfm4prGa6y4E06GKpyHlpcCam1jdZ87bOcQmYyGX68FrspesKxfO9Kf4DkL22IDOtBgVfw-FWpnMXoxx-vUrB6m9R1y33zg7mWvy0MTnTsxTvqyGwoD7t4hD-MdRs60DTz6-A2=w2566-h1864-no" height=450 />

--
以下のように「Use classpath of module：」で「forge-1.10.2-12.18.1.2014-mdk_main」を選択します。

<img src="https://lh3.googleusercontent.com/yJaQtdVOTafvh86C8bLHHiuFE2A6alFhEx4biqvyFEq-IZevyn4K17thogSQb7I0oEGDnCRd1TNZVft32lzgcg7VI-jPPyLU_UVKRvmtqwSgRe7ORbdjXgjeSXn2oHaXVn4e4OKQYK80PrsoulmH-ynrPkTM0Kk3Da5TZcvo-TXKR3cJbsx12IhlFMndqN6bPSzg5oGqEqAs1ezF8ZbdDIep-FR3pcw0AXsoE49v4W7dfAACSY5UYQp8uOKhJRPodPJ6nZdYrAdVuQD9K64E309vILZi8xKx6KhG1B20kQV9nOgr7kBhBocTkf015TX6DY0941AAexG1CgcL29mbs28kmecZ5ZYIaQJQsSjs7lGjE-S7Rl8idOYvt7y-vPgiiWp0cBpGONhqBA2tdg5QI0oxX4ZNblhdj408J5OUs_ILcjmVPmF8LW9RX_EMi71s9EwCe18spkhbRFyDxWwjO19Vd0qcyrr9ZuGFkoup_i52wn4YAkMcEkaG4oCiNlq7ANHKY8MDVxOkmU-qhLRo6PJklsYZPqHqgu8s9QZl8g0AOFdlMe6GIoyBGxpdj8USG6xE772dP98BWbB4PXST8AZA7AsCl7Hb=w2134-h1334-no" height=450 />

--
ここまで設定すると、実行ボタンを押すことでMODが導入されたMinecraftが起動します。
これで、開発するための環境が整いました。

---
# MinecraftのMODの開発
Javaの解説長いので続きはGithub or ドットスタジオで公開される記事で！

---
# まとめ
- 「仮想現実は、いずれただの現実になります」
- IoTの技術を使うことで、VR以外にも仮想現実をただの現実とする事ができる
- WioNode
 - Rest APIを叩けばJavaからも操作ができる
- Minecraft ForgeGradle
 - ちょっと難しい
