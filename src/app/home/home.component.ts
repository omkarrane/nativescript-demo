import { Component, OnInit } from "@angular/core";
import * as TNSPhone from 'nativescript-phone';
import * as Permissions from 'nativescript-permissions';

// Code created with command <tns create HelloWorld --template tns-template-blank-ng>


class CustomPhoneListener extends android.telephony.PhoneStateListener {
  prevState: number;

  constructor(state) {
    super();
    this.prevState = state;
    console.log("CustomPhoneListener.constructor");
  }

  onCallStateChanged(state: number, incomingNumber: string) {
    // if issue on incoming/outgoing flow refer https://stackoverflow.com/questions/21990947/detect-the-end-of-an-answered-incoming-call-by-user-in-android-not-declined
    try {
      console.log("CustomPhoneListener.onCallStateChanged");
      switch (state) {
        case android.telephony.TelephonyManager.CALL_STATE_RINGING: {
          console.log("CustomPhoneListener.CALL_STATE_RINGING");
          this.prevState = state;
          break;
        }
        case android.telephony.TelephonyManager.CALL_STATE_OFFHOOK: {
          console.log("CustomPhoneListener.CALL_STATE_OFFHOOK");
          this.prevState = state;
          break;
        }
        case android.telephony.TelephonyManager.CALL_STATE_IDLE: {
          console.log("CustomPhoneListener.CALL_STATE_IDLE");
          if (this.prevState == android.telephony.TelephonyManager.CALL_STATE_OFFHOOK) {
            this.prevState = state;
            // Answered call which is ended
          }
          if (this.prevState == android.telephony.TelephonyManager.CALL_STATE_RINGING) {
            this.prevState = state;
            // Rejected or Missed Call
          }
          break;
        }
        default: {
          console.log("CustomPhoneListener.default");
          break;
        }
      }
    }
    catch (e) {
      console.log("CustomPhoneListener.error", e);
    }
  }
}

// class CustomBroadcastReceiver extends android.content.BroadcastReceiver {
//   public mContext: android.content.Context;
//   public incoming_number: string;

//   onReceive(context: android.content.Context, intent: android.content.Intent) {
//     try {
//       console.log("CustomBroadcastReceiver.onReceive");
//       let telephony = new android.telephony.TelephonyManager();
//       telephony = context.getSystemService(android.content.Context.TELEPHONY_SERVICE);
//       let customPhoneListener = new CustomPhoneListener(null);
//       telephony.listen(customPhoneListener, android.telephony.PhoneStateListener.LISTEN_CALL_STATE);

//       let bundle = new android.os.Bundle();
//       bundle = intent.getExtras();
//       let phoneNr = bundle.getString("incoming_numer");
//       console.log("phone_number", phoneNr);
//       this.mContext = context;
//     }
//     catch (e) {
//       console.log("CustomBroadcastReceiver.error", e);
//     }
//   }
// }

@JavaProxy("in.moneytor.PhoneCallReceiver")  // https://stackoverflow.com/questions/58359761/nativescript-angular-unable-to-instantiate-receiver-didnt-find-class
@Component({
  selector: "Home",
  templateUrl: "./home.component.html"
})
export class HomeComponent extends android.content.BroadcastReceiver implements OnInit {  // https://stackoverflow.com/questions/5869269/how-to-get-call-end-event-in-android-app
  // https://www.geeksforgeeks.org/android-how-to-request-permissions-in-android-application/
  // public READ_PHONE_STATE_PERMISSION = 100;
  public mContext: android.content.Context;
  public incoming_number: string;


  constructor() {
    // Use the component constructor to inject providers.
    super();
    console.log("home.component started");
  }

  onReceive(context: android.content.Context, intent: android.content.Intent) {
    try {
      console.log("CustomBroadcastReceiver.onReceive");
      let telephony;
      telephony = context.getSystemService(android.content.Context.TELEPHONY_SERVICE);
      let customPhoneListener = new CustomPhoneListener(null);
      telephony.listen(customPhoneListener, android.telephony.PhoneStateListener.LISTEN_CALL_STATE);

      let bundle = new android.os.Bundle();
      bundle = intent.getExtras();
      let phoneNr = bundle.getString("incoming_numer");
      console.log("phone_number", phoneNr);
      this.mContext = context;
    }
    catch (e) {
      console.log("CustomBroadcastReceiver.error", e);
    }
  }

  // onCreate(savedInstanceState: android.os.Bundle) {
  //   super.onCreate(savedInstanceState);
  //   androidx.core.app.ActivityCompat.requestPermissions(
  //     this, 
  //     android.Manifest.permission.READ_PHONE_STATE, 
  //     this.READ_PHONE_STATE_PERMISSION
  //   );
  // }

  // onRequestPermissionsResult(requestCode: number, permissions: string[], grantResults: number[]) {
  //   super.onRequestPermissionsResult(requestCode, permissions, grantResults);

  //   if (requestCode == this.READ_PHONE_STATE_PERMISSION) {
  //     console.log("HomeComponent.onRequestPermissionsResult read the phone state");
  //   }
  // }

  ngOnInit(): void {
    // Init your component properties here.
    const phoneNumber = '9819574649';
    // https://www.thepolyglotdeveloper.com/2017/08/request-android-permissions-nativescript-angular/
    Permissions.requestPermissions([
      android.Manifest.permission.READ_PHONE_STATE,
      android.Manifest.permission.PROCESS_OUTGOING_CALLS,
      android.Manifest.permission.READ_CALL_LOG
    ], "Needed for testing")
      .then(() => {
        console.log("HomeComponent.ngOnInit permission granted");
        TNSPhone.requestCallPermission('You should accept the permission to be able to make a direct phone call.')
          .then((res) => {
            const callRes = TNSPhone.dial(phoneNumber, false);
            console.log('Call Response', callRes);
          })
          .catch((e) => {
            console.log("TNSPhone.requestCallPermission", e);
            const catchCallRes = TNSPhone.dial(phoneNumber, true);
            console.log('on catch block response: ', catchCallRes);
          });
      })
      .catch(e => {
        console.log("HomeComponent.ngOnInit permission failed", e);
      })
  }
}
