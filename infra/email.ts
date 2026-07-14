import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { vpc } from "./database";

// SES sender is managed manually in AWS (verified once per account).
// Lambda sends mail via SESv2 using MAIL_FROM from secrets and the VPC endpoint below.

// Private SES API access for Lambda in VPC (no NAT gateway required).
export const sesApiEndpoint = pulumi
  .all([vpc.id, vpc.privateSubnets, vpc.securityGroups])
  .apply(([vpcId, subnets, securityGroups]: [string, string[], string[]]) => {
    return new aws.ec2.VpcEndpoint("SesApiEndpoint", {
      vpcId,
      serviceName: "com.amazonaws.us-east-1.email",
      vpcEndpointType: "Interface",
      subnetIds: subnets,
      securityGroupIds: securityGroups,
      privateDnsEnabled: true,
    });
  });

export const sesPermissions = [
  {
    actions: ["ses:SendEmail", "ses:SendRawEmail"],
    resources: ["*"],
  },
];
