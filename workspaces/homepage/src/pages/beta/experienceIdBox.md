---
path: /experience-identity-box
title: Experience Identity Box
tag: beta
---

> You can join our Early Access Program by subscribing at [https://mailchi.mp/d0a5998cc646/identity-box-eap](https://mailchi.mp/d0a5998cc646/identity-box-eap).

If you are invited to our Early Access Program via [TestFlight](https://developer.apple.com/testflight/) (iOS) or [Expo](https://expo.io) (Android, coming soon) you can help us evaluating Identity Box even before actual boxes are made available.

For this purpose, specially for our early adopters, we created a *virtual* Identity Box that can be used when testing the IdentityBox app.

When you start your IdentityBox app for the first time, you will be asked to scan your Identity Box's QRCode in order to establish a one-to-one connection between your Identity Box app and your Identity Box:

<a name="figure-1"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Scan IdentityBox QRCode" src="images/ConnectToIdBox.png" />
</div>
<p class="figure-title"><b>Figure 1</b> Connect to Identity Box</p>
</div>

Here, we want you to use our virtual Identity Box by scanning the following QRCode:

<a name="figure-2"></a> 
<div class="flex-wrap">
<div style="width: 300px;">
  <img alt="Virtual IdentityBox QRCode" src="images/QRCodeStockholm.png" />
</div>
<p class="figure-title"><b>Figure 2</b> Virtual Identity Box QRCode</p>
</div>

After scanning this QRCode, you will be able to create your first identity. Future test versions will let you create multiple identities and conveniently switch between them, but for now, we only allow for one identity:

<a name="figure-3"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Create First Identity" src="images/CreateFirstIdentity.png"/>
</div>
<p class="figure-title"><b>Figure 3</b> Create your first identity</p>
</div>

At this early stage, we require that your "easy to remember" name to be unique - we recommend you to use your full name or some identifier that you can consider unique. If you name is already use by another tester, creating your Identity will fail and the app at its current stage does not handle bad-weather scenario well. If you after providing the name and pressing *Create* the app does not move to the next screen, please kill the app, start it again, and try a different name. The following builds will provide better handling of conflicts and enable switching between boxes, so this problem is only temporary and not highly relevant at this initial testing phase.

After your name is successfully created (this happens normally very fast), you will see the following screen (here I used the name *Zygfryd*):

<a name="figure-4"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Current Identity View" src="images/Zygfryd.png"/>
</div>
<p class="figure-title"><b>Figure 4</b> Current Identity View</p>
</div>

You can now also open *Address Book* tab, to see your own, and your peer identities:

<a name="figure-5"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Address Book" src="images/AddressBook.png"/>
</div>
<p class="figure-title"><b>Figure 5</b> Address Book</p>
</div>

By selecting an identity in the address book, you can see its details, and more importantly, you can share
identity with your peers by letting them scan the QRCode visible in the Identity Details view.

You add peer identities to your address book by scanning QRCode of your peers from the Current Identity view and the by adding a descriptive name to your new *contact* - this new name never leaves your mobile.

<a name="figure-6"></a> 
<div class="scrollable flex-wrap responsive">
<div class="bordered-content-600">
  <img alt="Adding Peer Identity" src="images/NewPeerIdentity.png"/>
</div>
</div>
<div class="flex-wrap responsive">
<p class="figure-title"><b>Figure 6</b> Adding Peer Identity</p>
</div>

Currently, you can only add and remove your peer identities. In the future a similar functionality will be provided
for your own identities.

<a name="figure-7"></a> 
<div class="scrollable flex-wrap responsive">
<div class="bordered-content-600">
  <img alt="Identity Details" src="images/IdentityDetails.png"/>
</div>
</div>
<div class="flex-wrap responsive">
<p class="figure-title"><b>Figure 7</b> Identity Details</p>
</div>

If you want to experience using Identity Box app, we provide a simple secret sharing portal called *Hush Hush*, where you can securely exchange secrets with your peers. Please visit <a href="https://idbox.online/hush-hush" target="_blank">Hush Hush</a> and follow
the instructions.

> Hint - you can send secrets to yourself as well.

We appreciate your all your feedback and we thank you for helping us build the self-sovereign identity system of the future!

<br/><br/>
Your *Identity Box team*

<style scoped>
.scrollable {
  width: 100%;
  overflow-x: auto;
}
.flex-wrap {
  display:flex;
  flex-flow:column;
  justify-content:center;
  align-items: center;
}
@media (max-width: 650px) {
  .responsive {
    align-items: flex-start;
  }  
}
.figure-title {
  font-size: 0.8em
}
.bordered-content-600 {
  width: 600px;
  border: 1px solid black;
}
.bordered-content-300 {
  width: 300px;
  border: 1px solid black;
}
</style>
