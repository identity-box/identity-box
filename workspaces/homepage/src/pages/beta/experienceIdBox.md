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
  <img alt="Scan IdentityBox QRCode" src="assets/ExperienceIdBox-assets/ConnectToIdBox.png" />
</div>
<p class="figure-title"><b>Figure 1</b> Connect to Identity Box</p>
</div>

Here, we want you to use our virtual Identity Box by scanning the following QRCode:

<a name="figure-2"></a> 
<div class="flex-wrap">
<div style="width: 300px;">
  <img alt="Virtual IdentityBox QRCode" src="assets/ExperienceIdBox-assets/QRCodeStockholm.png" />
</div>
<p class="figure-title"><b>Figure 2</b> Virtual Identity Box QRCode</p>
</div>

After scanning this QRCode, you will be able to create your first identity. Identity App allows for multiple identities, here you create your very first one:

<a name="figure-3"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Create First Identity" src="assets/ExperienceIdBox-assets/CreateFirstIdentity.png"/>
</div>
<p class="figure-title"><b>Figure 3</b> Create your first identity</p>
</div>


Enter your first identity name and tap _Create_.

> The identity name is not shared with anyone. It is only present on your mobile so that it is easier for you to distinguish one name from another.

After your first identity is successfully created, you will see the following screen (here I used the name *Zygfryd*):

<a name="figure-4"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Current Identity View" src="assets/ExperienceIdBox-assets/Zygfryd.png"/>
</div>
<p class="figure-title"><b>Figure 4</b> Current Identity View</p>
</div>

You can now also open *Address Book* tab, to see your own, and your peer identities:

<a name="figure-5"></a> 
<div class="flex-wrap">
<div class="bordered-content-300">
  <img alt="Address Book" src="assets/ExperienceIdBox-assets/AddressBook.png"/>
</div>
<p class="figure-title"><b>Figure 5</b> Address Book</p>
</div>

By selecting an identity in the address book, you can see its details, and more importantly, you can share
identity with your peers by letting them scan the QRCode visible in the Identity Details view.

You add peer identities to your address book by scanning the QRCode of your peer from the Identity tab and then by adding a descriptive name for your new *contact* - this new name never leaves your mobile.

<a name="figure-6"></a> 
<div class="scrollable flex-wrap responsive">
<div class="bordered-content-600">
  <img alt="Adding Peer Identity" src="assets/ExperienceIdBox-assets/NewPeerIdentity.png"/>
</div>
</div>
<div class="flex-wrap responsive">
<p class="figure-title"><b>Figure 6</b> Adding Peer Identity</p>
</div>

In order to create another identity (i.e. your own identity) tap on the _Create New Identity_ icon in the top-right part of the navigation bar in the _Address Book_ tab:

<a name="figure-7"></a> 
<div class="scrollable flex-wrap responsive">
<div class="bordered-content-600">
  <img alt="Creating a new Identity" src="assets/ExperienceIdBox-assets/CreateNewIdentity.png"/>
</div>
</div>
<div class="flex-wrap responsive">
<p class="figure-title"><b>Figure 7</b> Creating a new identity</p>
</div>

Finally, you can also delete identity by first tapping on the given identity in the _Address Book_ tab and then by tapping on _Delete this identity_ button. This works the same way for both you own identities and you peer identities, except that when you delete your own identity, it is also removed from your identity box.

<a name="figure-8"></a> 
<div class="scrollable flex-wrap responsive">
<div class="bordered-content-600">
  <img alt="Identity Details and deleting identities" src="assets/ExperienceIdBox-assets/IdentityDetails.png"/>
</div>
</div>
<div class="flex-wrap responsive">
<p class="figure-title"><b>Figure 8</b> Identity Details: deleting identities</p>
</div>

Identity App also provides the _Settings_ tab, where you can enable backups and reset your app and identity box. Please consult [Automatic Backups](/backups) to learn more.



You can already experience using Identity Box app in a real-life app. We built a simple secret sharing portal called *Hush Hush*, where you can securely exchange secrets with your peers. Please visit <a href="https://idbox.online/hush-hush" target="_blank">Hush Hush</a> and follow
the instructions.

> Hint - you can exchange secrets between your own identities as well - e.g. you can use Hush Hush to share secrets with yourself.

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
