import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import queryString from 'query-string';
import { LinkErrorCode, LinkErrorType, LinkExitMetadataStatus } from './const';

let reloadUrl = '';

export default function PlaidLink({
  linkToken,
  uri,
  onEvent,
  onExit,
  onSuccess,
}: any) {
  let webviewRef = useRef<any>();
  let hasReloaded = false;

  const handleNavigationStateChange = (event: any) => {
    if (event.url.includes('receivedRedirectUri')) {
      return true;
    }

    if (hasReloaded) {
      onSuccess({
        publicToken: '',
        nextFlowReady: true,
        nextFlowUri: reloadUrl,
      });
      return true;
    }

    if (
      event.url.includes('create-react-app-gold-zeta-41.vercel.app') &&
      !hasReloaded
    ) {
      reloadUrl = `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${linkToken}&receivedRedirectUri=${encodeURIComponent(
        event.url,
      )}`;
      hasReloaded = true;
      return false;
    }

    if (event.url.startsWith('plaidlink://')) {
      const eventParams = queryString.parse(event.url.replace(/.*\?/, ''));

      const linkSessionId = eventParams.link_session_id;
      const mfaType = eventParams.mfa_type;
      const requestId = eventParams.request_id;
      const viewName = eventParams.view_name;
      const errorCode = eventParams.error_code;
      const errorMessage = eventParams.error_message;
      const errorType = eventParams.error_type;
      const exitStatus = eventParams.exist_status;
      const institutionId = eventParams.institution_id;
      const institutionName = eventParams.institution_name;
      const institutionSearchQuery = eventParams.institution_search_query;
      const timestamp = eventParams.timestamp;

      if (event.url.startsWith('plaidlink://event') && onEvent) {
        onEvent({
          eventName: eventParams.event_name,
          metadata: {
            linkSessionId,
            mfaType,
            requestId,
            viewName,
            errorCode,
            errorMessage,
            errorType,
            exitStatus,
            institutionId,
            institutionName,
            institutionSearchQuery,
            timestamp,
          },
        });
      } else if (event.url.startsWith('plaidlink://exit') && onExit) {
        onExit({
          error: {
            errorCode: LinkErrorCode[errorCode],
            errorMessage: eventParams.error_message,
            errorType: LinkErrorType[errorType],
          },
          metadata: {
            status: LinkExitMetadataStatus[exitStatus],
            institution: {
              id: institutionId,
              name: institutionName,
            },
            linkSessionId,
            requestId,
          },
        });
      } else if (event.url.startsWith('plaidlink://connected') && onSuccess) {
        const publicToken = eventParams.public_token;
        const accounts = JSON.parse(eventParams.accounts as string);
        onSuccess({
          publicToken,
          metadata: {
            institution: {
              id: institutionId,
              name: institutionName,
            },
            accounts,
            linkSessionId,
          },
        });
      }
      return false;
    }

    return true;
  };

  return (
    <WebView
      source={{
        uri: uri ?
          uri :
          `https://cdn.plaid.com/link/v2/stable/link.html?isWebview=true&token=${linkToken}`,
      }}
      ref={(ref) => (webviewRef = ref as any)}
      onError={() => (webviewRef as any).reload()}
      originWhitelist={['https://*', 'plaidlink://*']}
      onShouldStartLoadWithRequest={handleNavigationStateChange}
    />
  );
}
