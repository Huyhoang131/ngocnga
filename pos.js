import { Component, OnInit } from "@angular/core";
import { Backlight } from "@ionic-native/backlight/ngx";
import { Flashlight } from "@ionic-native/flashlight/ngx";
import { TextToSpeech } from "@ionic-native/text-to-speech/ngx";
import { NavController } from "@ionic/angular";
import { OCR, OCRResult, OCRSourceType } from "@ionic-native/ocr/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { Facebook, FacebookLoginResponse } from "@ionic-native/facebook/ngx";
import firebase from "firebase";
import { error } from "protractor";

@Component({
  selector: "app-huytest",
  templateUrl: "./huytest.page.html",
  styleUrls: ["./huytest.page.scss"],
})
export class HuytestPage implements OnInit {
  public backlightStatus: boolean = false;
  public flashlightStatus: boolean = false;
  public textToSpeech: string = "Hello word";
  public nameUserLogin: string = "";
  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
  };

  constructor(
    public navCtrl: NavController,
    public backlight: Backlight,
    private flashlight: Flashlight,
    private tts: TextToSpeech,
    private ocr: OCR,
    private camera: Camera,
    private facebook: Facebook
  ) {}

  ngOnInit() {}

  turnOnBacklight() {
    this.backlight.on().then(() => {
      this.backlightStatus = true;
      console.log("backlight on");
    });
  }

  turnOffBacklight() {
    this.backlight.off().then(() => {
      this.backlightStatus = false;
      console.log("backlight off");
    });
  }

  switchFlashlight() {
    if (this.flashlightStatus) {
      this.flashlight.switchOff();
      this.flashlightStatus = false;
    } else {
      this.flashlight.switchOn();
      this.flashlightStatus = true;
    }
  }

  speechText(text) {
    this.tts
      .speak(text)
      .then(() => console.log("Success"))
      .catch((reason: any) => console.log(reason));
  }

  openCamera() {
    this.camera.getPicture(this.options).then(
      (imageData) => {
        this.readTextByOCR(imageData);
      },
      (err) => {
        // Handle error
      }
    );
  }

  readTextByOCR(filePath) {
    this.ocr
      .recText(OCRSourceType.NORMFILEURL, filePath)
      .then((res: OCRResult) => {
        // console.log(res);
        var blockText = res.blocks.blocktext;
        blockText.forEach((element) => {
          alert(element);
          this.textToSpeech += `${element}`;
        });
      })
      .catch((error: any) => console.error(error));
  }

  facebookLogin(): Promise<any> {
    return this.facebook
      .login(["public_profile", "user_friends", "email"])
      .then((response: FacebookLoginResponse) => {
        console.log("Logged into Facebook!", response);

        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(
          response.authResponse.accessToken
        );

        firebase
          .auth()
          .signInWithCredential(facebookCredential)
          .then((success) => {
            alert("Login Success");
            this.nameUserLogin = `Hello ${success.user.displayName}`;
          })
          .catch((error) => {
            alert(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  facebookLogOut(): Promise<any> {
    return this.facebook
      .logout()
      .then((response: FacebookLoginResponse) => {
        console.log("Logged out Facebook!", response);

        if (response) {
          firebase
            .auth()
            .signOut()
            .then((success) => {
              alert("Logout Success");
              this.nameUserLogin = ``;
            })
            .catch((error) => {
              alert(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
