<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-button @click="closeModal()">
          <ion-icon slot="icon-only" :icon="closeOutline" />
        </ion-button>
      </ion-buttons>
      <ion-title>{{ translate('Reset Password') }}</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content>
    <ion-item lines="none">
      <ion-input id="inputElement" :label="translate('Username')" :placeholder="translate('username')" v-model="user" />
    </ion-item>
    <ion-item lines="none">
      <ion-icon :icon="informationOutline" slot="start" />
      <ion-label>
        {{ translate("Your username must have an email already associated with it in HotWax to receive a reset password email. If you do not have an email linked to your account already, please contact your administrator to manually reset your password.") }}
      </ion-label>
    </ion-item>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="sendResetPasswordLink">
        <ion-icon :icon="sendOutline" />
      </ion-fab-button>
    </ion-fab>
  </ion-content>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import { defineComponent } from "vue";
import { closeOutline, informationOutline, sendOutline } from "ionicons/icons";
import { translate } from '@/i18n'
import { UserService } from "@/services/UserService";
import { hasError } from "@hotwax/oms-api";
import { showToast } from "@/util";

export default defineComponent({
  name: "ResetPasswordModal",
  components: {
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonTitle,
    IonToolbar
  },
  data() {
    return {
      user: "" as any
    }
  },
  props: ["username"],
  mounted() {
    this.user = this.username
  },
  methods: {
    closeModal() {
      modalController.dismiss()
    },
    async sendResetPasswordLink() {
      try {
        const resp = await UserService.forgotPassword({ userName: this.user });
        if(hasError(resp)) {
          throw { errorMessage: resp.data._ERROR_MESSAGE_ ? resp.data._ERROR_MESSAGE_ : "Failed to send reset password mail either your username is incorrect or your account do not have a registered mail id" }
        } else {
          showToast(resp.data._EVENT_MESSAGE_ ? resp.data._EVENT_MESSAGE_ : "Reset password mail has been sent to the registered mail id.")
        }
      } catch(err: any) {
        console.error(err)
        showToast(err.errorMessage ? err.errorMessage : "Something went wrong while sending reset password mail, please try again.")
      }
    }
  },
  setup() {
    return {
      closeOutline,
      informationOutline,
      sendOutline,
      translate
    };
  },
});
</script>