#!/usr/bin/env node
// Central Autonomous AI Clothing Business Manager CLI
// The primary conversational interface for the Business Owner in VS Code terminal.

import readline from 'node:readline';
import { processOwnerRequest } from './lib/business-manager/manager-orchestrator.ts';
import type { BusinessManagerRequest } from './lib/business-manager/types.ts';
import { getPendingOwnerApprovals, formatCLIContentReviewCard } from './lib/business-manager/approval-manager.ts';

function parseCliArgs(args: string[]): BusinessManagerRequest & { interactive: boolean; showApprovals: boolean; approveId?: string; feedbackText?: string; authPublishId?: string } {
  let query = '';
  let inputPhoto: string | undefined;
  let inputVideo: string | undefined;
  let competitorUrl: string | undefined;
  let targetGarment: string | undefined;
  let targetAudience: string | undefined;
  let campaignTheme: string | undefined;
  let approvalId: string | undefined;
  let feedbackText: string | undefined;
  let authPublishId: string | undefined;
  let interactive = false;
  let showApprovals = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === '--interactive' || a === '-i') {
      interactive = true;
    } else if (a === '--daily') {
      query = 'What should we post today?';
    } else if (a === '--promote') {
      targetGarment = args[++i];
      query = `Promote ${targetGarment || 'garment'}`;
    } else if (a === '--analyze-link') {
      competitorUrl = args[++i];
      query = `Analyze competitor link: ${competitorUrl}`;
    } else if (a === '--edit-footage') {
      inputVideo = args[++i];
      query = `Create professional video from footage: ${inputVideo}`;
    } else if (a === '--input-photo') {
      inputPhoto = args[++i];
    } else if (a === '--input-video') {
      inputVideo = args[++i];
    } else if (a === '--campaign') {
      campaignTheme = args[++i];
    } else if (a === '--audience') {
      targetAudience = args[++i];
    } else if (a === '--status') {
      query = 'business status snapshot';
    } else if (a === '--review-approvals') {
      showApprovals = true;
    } else if (a === '--approve') {
      approvalId = args[++i];
      query = `approve ${approvalId}`;
    } else if (a === '--request-changes') {
      approvalId = args[++i];
      query = `request changes ${approvalId}`;
    } else if (a === '--feedback') {
      feedbackText = args[++i];
    } else if (a === '--authorize-publish') {
      authPublishId = args[++i];
      query = `authorize publishing ${authPublishId}`;
    } else if (!a.startsWith('-')) {
      query = query ? `${query} ${a}` : a;
    }
  }

  // If no args provided, enter interactive mode
  if (!query && !showApprovals && !approvalId && !authPublishId) {
    interactive = true;
  }

  return {
    query: query || 'What should we post today?',
    inputPhoto,
    inputVideo,
    competitorUrl,
    targetGarment,
    targetAudience,
    campaignTheme,
    approvalId,
    feedback: feedbackText,
    interactive,
    showApprovals,
    authPublishId
  };
}

async function startInteractiveSession(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`================================================================================`);
  console.log(`MONAVI COLLECTION — AUTONOMOUS AI CLOTHING BUSINESS MANAGER`);
  console.log(`Tagline: "WEAR YOUR STORY."`);
  console.log(`Personal AI Business Assistant & Marketing Strategist`);
  console.log(`Type your business questions or commands. Type "exit" or "quit" to leave.`);
  console.log(`================================================================================\n`);

  // Initial welcome brief
  const initialBrief = await processOwnerRequest({ query: 'What should we post today?' });
  console.log(initialBrief);
  console.log(`\n--------------------------------------------------------------------------------`);

  const promptUser = () => {
    rl.question('\n[Owner] > ', async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log('\nExiting AI Clothing Business Manager session. Have a productive day!\n');
        rl.close();
        process.exit(0);
      }

      try {
        const response = await processOwnerRequest({ query: trimmed });
        console.log(`\n${response}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`\n[AI Manager Error]: ${message}`);
      }
      promptUser();
    });
  };

  promptUser();
}

async function main(): Promise<void> {
  const parsed = parseCliArgs(process.argv.slice(2));

  // If asked to review pending approvals
  if (parsed.showApprovals) {
    const pending = getPendingOwnerApprovals();
    if (pending.length === 0) {
      console.log('\nAI CLOTHING BUSINESS MANAGER: No content currently awaiting owner review.\n');
      return;
    }
    console.log(`\nFound ${pending.length} content item(s) awaiting Owner Final Decision:\n`);
    for (const item of pending) {
      console.log(formatCLIContentReviewCard(item));
      console.log('\n');
    }
    return;
  }

  // If in interactive mode
  if (parsed.interactive) {
    await startInteractiveSession();
    return;
  }

  // Single query execution
  try {
    const response = await processOwnerRequest({
      query: parsed.query,
      intent: parsed.authPublishId ? 'authorize_publish' : undefined,
      inputPhoto: parsed.inputPhoto,
      inputVideo: parsed.inputVideo,
      competitorUrl: parsed.competitorUrl,
      targetGarment: parsed.targetGarment,
      targetAudience: parsed.targetAudience,
      campaignTheme: parsed.campaignTheme,
      approvalId: parsed.approvalId || parsed.authPublishId,
      feedback: parsed.feedback
    });
    console.log(`\n${response}\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n[AI Business Manager Error]: ${message}\n`);
    process.exit(1);
  }
}

main();
