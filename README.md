# Emails Input

Emails input component writing with Svelte.

## Live demo

https://miro-test-case.now.sh/

## Local demo

1. Clone project

```bash
git clone https://github.com/beloglazof/miro-test-case.git
```

2. Start [Rollup](https://rollupjs.org):

```bash
npm run start
```

3. Navigate to [localhost:5000](http://localhost:5000). You should see demo app running.

## Usage

Import `js` and `css` component files in html. By default they are in `public/build`

```html
<head>
  <!-- useful meta and other tags -->

  <link rel="stylesheet" href="/path/to/emailsInput.css" />
  <script src="/path/to/emailsInput.js"></script>
</head>
```

Markup node for component

```html
<div id="emails-input"></div>
```

Mount component in node

```html
<script>
  var emailsInputNode = document.querySelector('#emails-input');
  var emailsInputComponent = new EmailsInput({
    target: emailsInputNode,
  });
</script>
```

You can make several instance of component

```html
<script>
  var emailsInputNode = document.querySelector('#emails-input');
  var emailsInputComponent = new EmailsInput({
    target: emailsInputNode,
  });

  // some code

  var teamEmailsInputNode = document.querySelector('#team-emails-input');
  var teamEmailsInputComponent = new EmailsInput({
    target: teamEmailsInputNode,
  });
</script>
```

Component instance has useful API

## Component API

### `getEmails`

This method return all entered emails.

Example:

```javascript
var getEmails = emailsInputComponent.getEmails;
var emails = getEmails(); // [{value: 'mike@miro.com', valid: true}]
```

### `replaceEmails`

Parameter:

- `emails` - array of string

This method replace all entered emails with new ones.

Example:

```javascript
var replaceEmails = emailsInputComponent.replaceEmails;
replaceEmails(['hop', 'hey']);
```

### `onEmailsChange`

Parameters:

- `callback` - function

This method subscribes for emails list changes and fire callback function when it happen

Example:

```javascript
var onEmailsChange = emailsInputComponent.onEmailsChange;
onEmailsChange(function() {
  console.log('Emails list changed!');
});
```
