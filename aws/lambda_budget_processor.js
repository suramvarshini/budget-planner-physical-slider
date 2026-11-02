/**
 * AWS Lambda Function: Budget Telemetry & Alert Processor
 * Trigger: AWS IoT Core Rule on topic 'budget-planner/+/telemetry'
 * Services: Amazon DynamoDB (persistence), Amazon SNS (email alerts)
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' }));
const sns = new SNSClient({ region: process.env.AWS_REGION || 'ap-south-1' });

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'BudgetPlannerTelemetry';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';

exports.handler = async (event) => {
  console.log('Received IoT Telemetry Event:', JSON.stringify(event));

  const { deviceId, budgetValue, analogReading, deviceStatus, timestamp } = event;

  // 1. Persist telemetry reading to Amazon DynamoDB
  const item = {
    deviceId: deviceId || 'UNKNOWN-DEVICE',
    timestamp: timestamp || new Date().toISOString(),
    budgetValue: Number(budgetValue) || 0,
    analogReading: Number(analogReading) || 0,
    deviceStatus: deviceStatus || 'NORMAL',
    ttl: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days retention
  };

  try {
    await ddb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));
    console.log(`Telemetry successfully written to DynamoDB table ${TABLE_NAME}`);
  } catch (err) {
    console.error('DynamoDB write error:', err);
  }

  // 2. Evaluate Overspending Alert for Amazon SNS notification
  if (deviceStatus === 'OVER_BUDGET' && SNS_TOPIC_ARN) {
    const alertMessage = `
🚨 BUDGET ALERT NOTIFICATION
Device ID: ${deviceId}
Allocated Budget: ₹${budgetValue.toLocaleString('en-IN')}
Status: CRITICAL OVERSPENDING DETECTED
Timestamp: ${timestamp}

Your current recorded expenses have exceeded the monthly budget limit.
Please visit your Budget Simulation Dashboard to review expenses.
    `.trim();

    try {
      await sns.send(new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: `[BUDGET ALERT] Device ${deviceId} - Budget Exceeded!`,
        Message: alertMessage,
      }));
      console.log('SNS notification dispatched successfully');
    } catch (snsErr) {
      console.error('SNS dispatch error:', snsErr);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Telemetry processed successfully', deviceId }),
  };
};
