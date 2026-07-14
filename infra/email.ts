import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { vpc } from "./database";
import { sesSenderEmail } from "./secrets";

export const email = new sst.aws.Email("Email", {
  sender: sesSenderEmail.value,
});

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
