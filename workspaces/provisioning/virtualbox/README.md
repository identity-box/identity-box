# Provisioning identiy box - AWS

## Provision targets

- virtualbox

## Installation

### virtualbox

#### vagrant

Install vagrant:

``` bash
brew cask install vagrant
```

#### ansible

Install ansible:

```
pip3 install ansible
```
Install ansible dependencies:

```
ansible-galaxy install -r requirements.yml
```

#### node
Install ipfs node

``` bash
vagrant up
vagrant reload
vagrant halt
vagrant destroy
vagrant provision
vagrant ssh
```

## Links

This instruction is inspired by: [https://ronaldvaneede.me/setting-up-a-disposable-development-environment-with-virtualbox-vagrant-and-ansible-127816cd0479](https://ronaldvaneede.me/setting-up-a-disposable-development-environment-with-virtualbox-vagrant-and-ansible-127816cd0479)

