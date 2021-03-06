import { MessageService } from '../app/services/message.service';

import { FaceTecSessionResult, FaceTecIDScanResult } from "./core-sdk/FaceTecSDK.js/FaceTecPublicApi";
import { FaceTecSDK } from "./core-sdk/FaceTecSDK.js/FaceTecSDK";
import { LivenessCheckProcessor } from "./processors/LivenessCheckProcessor";
import { SampleAppUtilities } from "./utilities/SampleAppUtilities";
import { environment } from 'src/environments/environment';
import { Crypto } from './utilities/Crypto';
import * as FaceTecStringsEn from  './core-sdk-optional/FaceTecStrings.js'
import * as FaceTecStringsPtBr from  './core-sdk-optional/FaceTecStrings.pt-br.js'

export const AngularSampleApp = (function() {
  let latestEnrollmentIdentifier = "";
  let latestSessionResult: FaceTecSessionResult | null = null;
  let latestIDScanResult: FaceTecIDScanResult | null = null;
  let latestProcessor: LivenessCheckProcessor;
  let appkey: any;

  // Aguarde a conclusão do carregamento antes de tentar acessar o SDK do navegador.
  function loadAssets() {

    // Defina um caminho de diretório para outros recursos do FaceTec Browser SDK.
    FaceTecSDK.setResourceDirectory("/assets/core-sdk/FaceTecSDK.js/resources");

    // Defina o caminho do diretório para as imagens necessárias do FaceTec Browser SDK.
    FaceTecSDK.setImagesDirectory("/assets/core-sdk/FaceTec_images");

    // Inicialize o FaceTec Browser SDK e configure os recursos da interface do usuário.
    FaceTecSDK.initializeInProductionMode(environment.ProductionKeyText, environment.DeviceKeyIdentifier, environment.PublicFaceScanEncryptionKey, 
      function(initializedSuccessfully: boolean) {
        if(initializedSuccessfully) {
          SampleAppUtilities.enableControlButtons();
          
          //FaceTecSDK.configureLocalization({"localizationJSON": "br"});

          // Set localization
          FaceTecSDK.configureLocalization(FaceTecStringsPtBr);

        }
        SampleAppUtilities.displayStatus(FaceTecSDK.getFriendlyDescriptionForFaceTecSDKStatus(FaceTecSDK.getStatus()));
      });

    SampleAppUtilities.formatUIForDevice();
  };

  // Inicie um 3D Liveness Check.
  function onLivenessCheckPressed() {
    SampleAppUtilities.fadeOutMainUIAndPrepareForSession();

    // Obtenha um token de sessão do FaceTec SDK e inicie o 3D Liveness Check.
    getSessionToken(function(sessionToken) {
      latestProcessor = new LivenessCheckProcessor(sessionToken as string, AngularSampleApp as any);
    });
  }

  // Mostre o resultado final.
  function onComplete() {
    SampleAppUtilities.showMainUI();

    if(!latestProcessor.isSuccess()) {
      // Redefina o identificador de inscrição.
      latestEnrollmentIdentifier = "";

      // Mostrar mensagem de saída antecipada na tela. Se isso ocorrer, verifique os logs.
      SampleAppUtilities.displayStatus("A sessão foi encerrada antecipadamente, consulte os logs para obter mais detalhes.");

      return;
    }

    // Mostrar mensagem de sucesso na tela
    SampleAppUtilities.displayStatus("Success");
  }

  // Obter o token de sessão do servidor
  function getSessionToken(sessionTokenCallback: (sessionToken?: string)=>void) {
    const XHR = new XMLHttpRequest();
    XHR.open("POST", environment.apiUrl + "/facecaptcha/service/captcha/3d/session-token");
    XHR.setRequestHeader("Content-Type", "application/json");
    XHR.onreadystatechange = function() {
      if(this.readyState === XMLHttpRequest.DONE) {
        let sessionToken = "";
        let decryptedData = "";
        try {
          // Tente obter o sessionToken do objeto de resposta.
          decryptedData = Crypto.decChData(JSON.parse(this.response), appkey);
          sessionToken = JSON.parse(decryptedData).sessionToken;
          // Algo deu errado ao analisar a resposta. Retorna um erro.
          if(typeof sessionToken !== "string") {
            onServerSessionTokenError();
            return;
          }
        }
        catch {
          // Algo deu errado ao analisar a resposta. Retorna um erro.
          onServerSessionTokenError();
          return;
        }
        sessionTokenCallback(sessionToken);
      }
    };

    XHR.onerror = function() {
      onServerSessionTokenError();
    };

    // Parâmetros da requisição.
    var parameters = {
      appkey: getAppkey(),
      userAgent: FaceTecSDK.createFaceTecAPIUserAgentString("")
    };

    var jsonStringToUpload = JSON.stringify(parameters);
    
    XHR.send(jsonStringToUpload);
  }

  function onServerSessionTokenError() {
    SampleAppUtilities.handleErrorGettingServerSessionToken();
  }

  //
  // NOTA: Esta é uma função de conveniência apenas para fins de demonstração, para que o Aplicativo de Amostra possa ter acesso aos resultados da sessão mais recente.
  // No seu código, você pode nem querer ou precisar fazer isso.
  //
  function setLatestSessionResult(sessionResult: FaceTecSessionResult) {
    latestSessionResult = sessionResult;
  }

  function setLatestIDScanResult(idScanResult: FaceTecIDScanResult) {
    latestIDScanResult = idScanResult;
  }

  function getLatestEnrollmentIdentifier() {
    return latestEnrollmentIdentifier;
  }

  function setLatestServerResult(responseJSON: any) {
  }

  function clearLatestEnrollmentIdentifier(responseJSON: any) {
    latestEnrollmentIdentifier = "";
  }

  function redirectSendDocument() {
    MessageService.sendMessage(true);
  }

  function setAppkey(value: string) {
    appkey = value;
  }

  function getAppkey() {
    return appkey;
  }
  
  return {
    loadAssets,
    onLivenessCheckPressed,
    onComplete,
    setLatestSessionResult,
    setLatestIDScanResult,
    getLatestEnrollmentIdentifier,
    setLatestServerResult,
    clearLatestEnrollmentIdentifier,
    redirectSendDocument,
    setAppkey,
    getAppkey    
  };

})();
