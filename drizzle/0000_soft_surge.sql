CREATE TABLE `abTestVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`contentId` int,
	`impressions` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abTestVariants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `abTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`name` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`status` enum('draft','running','paused','completed','archived') NOT NULL DEFAULT 'draft',
	`winnerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` int,
	`dealId` int,
	`type` enum('call','email','meeting','note','task') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adPlatformCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`connectionId` int NOT NULL,
	`campaignId` int,
	`externalCampaignId` varchar(255),
	`platform` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` varchar(100),
	`budgetCents` int,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`spend` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adPlatformCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adPlatformConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('meta','google','tiktok','linkedin','pinterest','snapchat','amazon') NOT NULL,
	`accountId` varchar(255),
	`accountName` varchar(255),
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adPlatformConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`contentId` int,
	`platform` varchar(100),
	`eventType` varchar(100) NOT NULL,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`spend` int DEFAULT 0,
	`revenue` int DEFAULT 0,
	`metadata` json,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `approvalWorkflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`emailCampaignId` int,
	`requestedBy` int NOT NULL,
	`assignedTo` int NOT NULL,
	`status` enum('pending','approved','rejected','revision_requested') NOT NULL DEFAULT 'pending',
	`notes` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `approvalWorkflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automationWorkflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` json NOT NULL,
	`conditions` json,
	`actions` json NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`executionCount` int NOT NULL DEFAULT 0,
	`lastExecutedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automationWorkflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brandKits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`primaryColor` varchar(7),
	`secondaryColor` varchar(7),
	`accentColor` varchar(7),
	`backgroundColor` varchar(7),
	`textColor` varchar(7),
	`primaryFont` varchar(255),
	`secondaryFont` varchar(255),
	`logoUrl` text,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandKits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brandVoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`toneProfile` text,
	`formalityLevel` enum('very_formal','formal','neutral','casual','very_casual') DEFAULT 'neutral',
	`emotionalTriggers` json,
	`vocabularyPatterns` json,
	`sampleContent` text,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brandVoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`assetType` enum('content','email','landing_page','video','creative','ad') NOT NULL,
	`assetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaignAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int,
	`name` varchar(255) NOT NULL,
	`objective` enum('awareness','traffic','engagement','leads','sales','app_installs') NOT NULL DEFAULT 'awareness',
	`platforms` json,
	`strategy` json,
	`postingSchedule` json,
	`audienceTargeting` json,
	`budgetAllocation` json,
	`kpis` json,
	`status` enum('draft','active','paused','completed','archived') NOT NULL DEFAULT 'draft',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`messages` json NOT NULL,
	`activeProductId` int,
	`brandVoiceId` int,
	`recentCampaignId` int,
	`recentContentIds` json,
	`platformPreferences` json,
	`lastBuildSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`toolResults` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitorAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`competitorId` int NOT NULL,
	`alertType` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitorAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitorProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`positioning` text,
	`strengths` json,
	`weaknesses` json,
	`opportunities` json,
	`threats` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competitorProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitorSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`competitorId` int NOT NULL,
	`data` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitorSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`structure` text NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int,
	`campaignId` int,
	`brandVoiceId` int,
	`type` enum('ad_copy_short','ad_copy_long','blog_post','seo_meta','social_caption','video_script','email_copy','pr_release','podcast_script','tv_script','radio_script','copywriting','amazon_listing','google_ads','youtube_seo','twitter_thread','linkedin_article','whatsapp_broadcast','sms_copy','story_content','ugc_script','landing_page') NOT NULL,
	`platform` varchar(100),
	`title` text,
	`body` text NOT NULL,
	`score` int,
	`scoreDetails` json,
	`status` enum('draft','approved','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`language` varchar(10) DEFAULT 'en',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int,
	`campaignId` int,
	`type` enum('ad_image','social_graphic','thumbnail','banner','story','product_photo','meme','ad_with_copy') NOT NULL,
	`prompt` text NOT NULL,
	`imageUrl` text,
	`width` int,
	`height` int,
	`status` enum('pending','generating','completed','failed') NOT NULL DEFAULT 'pending',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`type` enum('spend','purchase','refund','bonus') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('purchase','spend','refund','bonus') NOT NULL,
	`amountCents` int NOT NULL,
	`description` text,
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `creditWallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balanceCents` int NOT NULL DEFAULT 0,
	`totalPurchasedCents` int NOT NULL DEFAULT 0,
	`totalSpentCents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creditWallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `creditWallets_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `customerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` int,
	`enrichedData` json,
	`journeyStage` varchar(100),
	`segment` varchar(100),
	`lifetimeValueCents` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customerProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`leadId` int,
	`name` varchar(255) NOT NULL,
	`stage` enum('prospecting','qualification','proposal','negotiation','closed_won','closed_lost') NOT NULL DEFAULT 'prospecting',
	`valueCents` int DEFAULT 0,
	`probability` int DEFAULT 0,
	`expectedCloseDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dspAdWallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balanceCents` int NOT NULL DEFAULT 0,
	`totalDepositedCents` int NOT NULL DEFAULT 0,
	`totalSpentCents` int NOT NULL DEFAULT 0,
	`totalMarkupEarnedCents` int NOT NULL DEFAULT 0,
	`epomAccountId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dspAdWallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `dspAdWallets_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `dspCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`walletId` int NOT NULL,
	`campaignId` int,
	`name` varchar(255) NOT NULL,
	`status` enum('draft','active','paused','completed') NOT NULL DEFAULT 'draft',
	`dailyBudgetCents` int NOT NULL,
	`totalBudgetCents` int NOT NULL,
	`spentCents` int NOT NULL DEFAULT 0,
	`targetingGeo` json,
	`targetingDemographics` json,
	`startDate` timestamp,
	`endDate` timestamp,
	`epomCampaignId` varchar(255),
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dspCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`listId` int,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500),
	`previewText` varchar(500),
	`htmlBody` text,
	`textBody` text,
	`fromName` varchar(255),
	`fromEmail` varchar(320),
	`status` enum('draft','scheduled','sending','sent','failed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`recipientCount` int DEFAULT 0,
	`openCount` int DEFAULT 0,
	`clickCount` int DEFAULT 0,
	`resendId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`listId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`subscribed` boolean NOT NULL DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emailLists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`contactCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailLists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formFields` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`type` enum('text','email','phone','textarea','select','checkbox','radio','file') NOT NULL,
	`label` varchar(255) NOT NULL,
	`placeholder` varchar(255),
	`required` boolean NOT NULL DEFAULT false,
	`options` json,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `formFields_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`formId` int NOT NULL,
	`data` json NOT NULL,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `formResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`landingPageId` int,
	`formId` int,
	`data` json NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `formSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forms_id` PRIMARY KEY(`id`),
	CONSTRAINT `forms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `funnelAbTestVariations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`content` json,
	`views` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnelAbTestVariations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnelAbTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funnelId` int NOT NULL,
	`stepId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`status` enum('running','paused','completed') NOT NULL DEFAULT 'running',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnelAbTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnelStepEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stepId` int NOT NULL,
	`type` enum('view','conversion') NOT NULL,
	`sessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnelStepEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnelSteps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funnelId` int NOT NULL,
	`type` enum('landing','form','payment','thank_you','upsell','email') NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255),
	`content` json,
	`order` int NOT NULL,
	`landingPageId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funnelSteps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`conversionGoal` varchar(255),
	`status` enum('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`accountId` varchar(255),
	`accountName` varchar(255),
	`accessToken` text,
	`refreshToken` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `landingPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int,
	`campaignId` int,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`headline` text,
	`subheadline` text,
	`htmlContent` text,
	`ctaText` varchar(255),
	`ctaUrl` text,
	`template` varchar(100),
	`isPublished` boolean NOT NULL DEFAULT false,
	`viewCount` int NOT NULL DEFAULT 0,
	`conversionCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `landingPages_id` PRIMARY KEY(`id`),
	CONSTRAINT `landingPages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`assignedTo` int,
	`firstName` varchar(255),
	`lastName` varchar(255),
	`email` varchar(320),
	`phone` varchar(50),
	`company` varchar(255),
	`source` varchar(100),
	`status` enum('new','contacted','qualified','unqualified','converted','lost') NOT NULL DEFAULT 'new',
	`score` int DEFAULT 0,
	`tags` json,
	`notes` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`alertType` varchar(100) NOT NULL,
	`threshold` float,
	`currentValue` float,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performanceMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`metricType` varchar(100) NOT NULL,
	`value` float NOT NULL,
	`trend` enum('up','down','flat') DEFAULT 'flat',
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performanceMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`videoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `personalVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictiveScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`campaignId` int,
	`predictedCtr` float,
	`predictedEngagement` float,
	`predictedConversionProbability` float,
	`qualityScore` int,
	`improvements` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predictiveScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`url` text,
	`description` text,
	`analysisStatus` enum('pending','analyzing','completed','failed') NOT NULL DEFAULT 'pending',
	`features` json,
	`benefits` json,
	`targetAudience` text,
	`positioning` text,
	`keywords` json,
	`tone` text,
	`competitiveAdvantages` json,
	`painPoints` json,
	`valueProps` json,
	`differentiators` json,
	`rawScrapedData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publishingCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`accountId` varchar(255),
	`accountName` varchar(255),
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publishingCredentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`code` varchar(50) NOT NULL,
	`status` enum('pending','completed','rewarded') NOT NULL DEFAULT 'pending',
	`rewardCents` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` int,
	`name` varchar(255) NOT NULL,
	`shareToken` varchar(255),
	`reportData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`),
	CONSTRAINT `reports_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `repurposedContents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`sourceContentId` int NOT NULL,
	`targetContentId` int,
	`targetFormat` varchar(100) NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `repurposedContents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `repurposingProjects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceContentId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetFormats` json,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `repurposingProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviewSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`profileUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviewSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`reviewerName` varchar(255),
	`rating` int,
	`content` text,
	`reviewUrl` text,
	`aiReply` text,
	`manualReply` text,
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduledPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` int,
	`campaignId` int,
	`platform` varchar(100) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`publishedAt` timestamp,
	`status` enum('pending','published','failed','canceled') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduledPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seoAudits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`keywords` json,
	`rankTracking` json,
	`siteStructure` json,
	`recommendations` json,
	`score` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seoAudits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialPublishQueue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scheduledPostId` int,
	`platform` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`mediaUrls` json,
	`status` enum('queued','processing','published','failed','retrying','canceled') NOT NULL DEFAULT 'queued',
	`attempts` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `socialPublishQueue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tier` enum('free','starter','professional','business','agency') NOT NULL DEFAULT 'free',
	`status` enum('active','trialing','past_due','canceled','unpaid') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`stripePriceId` varchar(255),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`trialStart` timestamp,
	`trialEnd` timestamp,
	`canceledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`role` enum('owner','admin','member','viewer') NOT NULL DEFAULT 'member',
	`status` enum('invited','active','inactive') NOT NULL DEFAULT 'invited',
	`inviteToken` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teamMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tierLimitsConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tier` enum('free','starter','professional','business','agency') NOT NULL,
	`aiGenerationsPerMonth` int NOT NULL DEFAULT 5,
	`aiImagesPerMonth` int NOT NULL DEFAULT 2,
	`videoScriptsPerMonth` int NOT NULL DEFAULT 0,
	`websiteAnalysesPerMonth` int NOT NULL DEFAULT 1,
	`maxProducts` int NOT NULL DEFAULT 1,
	`maxTeamMembers` int NOT NULL DEFAULT 1,
	`maxScheduledPosts` int NOT NULL DEFAULT 0,
	`dspEnabled` boolean NOT NULL DEFAULT false,
	`dspMarkupRateBps` int NOT NULL DEFAULT 2000,
	`dspMinAdSpendCents` int NOT NULL DEFAULT 5000,
	`webhooksEnabled` boolean NOT NULL DEFAULT false,
	`whitelabelEnabled` boolean NOT NULL DEFAULT false,
	`apiAccessEnabled` boolean NOT NULL DEFAULT false,
	`voiceAiEnabled` boolean NOT NULL DEFAULT false,
	`predictiveEnabled` boolean NOT NULL DEFAULT false,
	`seoAuditEnabled` boolean NOT NULL DEFAULT false,
	`musicStudioEnabled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tierLimitsConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `tierLimitsConfig_tier_unique` UNIQUE(`tier`)
);
--> statement-breakpoint
CREATE TABLE `userMemory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessContext` json,
	`preferences` json,
	`recentTopics` json,
	`persistentFacts` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userMemory_id` PRIMARY KEY(`id`),
	CONSTRAINT `userMemory_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userMonthlyUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`month` varchar(7) NOT NULL,
	`aiGenerationsUsed` int NOT NULL DEFAULT 0,
	`aiImagesUsed` int NOT NULL DEFAULT 0,
	`videoScriptsUsed` int NOT NULL DEFAULT 0,
	`videoMinutesUsed` int NOT NULL DEFAULT 0,
	`websiteAnalysesUsed` int NOT NULL DEFAULT 0,
	`abTestsUsed` int NOT NULL DEFAULT 0,
	`scheduledPostsUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userMonthlyUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timezone` varchar(100) DEFAULT 'UTC',
	`defaultLanguage` varchar(10) DEFAULT 'en',
	`emailNotifications` boolean DEFAULT true,
	`pushNotifications` boolean DEFAULT true,
	`weeklyReportEnabled` boolean DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSettings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`subscriptionTier` enum('free','starter','professional','business','agency') NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `videoAds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int,
	`campaignId` int,
	`platform` enum('tiktok','youtube','reels','youtube_shorts','facebook','snapchat','pinterest') NOT NULL,
	`adPreset` varchar(100),
	`script` text NOT NULL,
	`hook` text,
	`duration` int,
	`actorId` varchar(100),
	`emotion` enum('excited','calm','urgent','friendly','authoritative','neutral','empathetic','surprised') DEFAULT 'neutral',
	`language` varchar(10) DEFAULT 'en',
	`status` enum('draft','rendering','completed','failed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoAds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videoRenders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`videoAdId` int,
	`provider` enum('heygen','runway','luma','kling') NOT NULL,
	`externalJobId` varchar(255),
	`videoUrl` text,
	`thumbnailUrl` text,
	`durationSeconds` int,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videoRenders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEndpoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`events` json NOT NULL,
	`secret` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastTriggeredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookEndpoints_id` PRIMARY KEY(`id`)
);
