import EmailsInput from './EmailsInput.svelte';
import { emails as emailsStore } from './emailsStore';
import { get } from 'svelte/store';

export function getEmails() {
  return get(emailsStore);
}

export function replaceEmails(newEmails) {
  emailsStore.set(newEmails);
}

export function onEmailsChange(cb) {
  emailsStore.subscribe(cb);
}

export default EmailsInput;
