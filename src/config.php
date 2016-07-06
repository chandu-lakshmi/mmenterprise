<?php
// Global config values should be defiled here
$hostName = gethostname();

// deciding the environemt
switch ($hostName) {
	case 'scotchbox':
		$environemt = 'local';
		break;
	case 'mintmeshstg.com':
		$environemt = 'review';
		break;
	case 'mintmesh.com':
		$environemt = 'staging';
		break;
	default:
		// default for production
		$environemt = '';
		break;
}