# Provisioning identiy box - AWS

## Provision targets

- Amazon EC2 node

## Installation

### Amazon

#### Create an ec2 instance

Create an instance with Ubuntu.
t2.small with 8 gb SSD storage

#### Open ssh port

Create security group with port 22 open.

#### Install Ansible

Install ansible on your local machine.
[Installation guide ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

#### Configuration `hosts` file.

- add location of your pem file. `ansible_ssh_private_key_file`
- add ip-address. `instances` ( Replace the `x.x.x.x` )

#### Modify `awscreds.conf` file.

Add your `AWSAccessKeyId` and `AWSSecretKey`

You should add your AWS access key and AWS secret key. (Log in to your AWS Management Console -> Click on your user name at the top right of the page -> Click on the Security Credentials link from the drop-down menu.)

#### Run ansible playbook.

Run Ansible playbook. It first installs the necessary packages, then downloads and unzips the monitoring scripts, and then creates the cron task.

  $ ansible-playbook -b aws_monitoring_playbook.yaml

Ansible can show a warning. Nevermind.


## Links

This instruction is inspired by: [https://medium.com/@_oleksii_/monitoring-memory-and-disk-metrics-in-aws-cloudwatch-cf736153f488](https://medium.com/@_oleksii_/monitoring-memory-and-disk-metrics-in-aws-cloudwatch-cf736153f488)

