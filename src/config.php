<?php
// Global config values should be defiled here
$hostName = gethostname();

// deciding the environment
switch ($hostName) {
	case 'scotchbox':
		$environment = '_local';
		break;
	case 'mintmeshstg.com':
		$environment = '_review';
		break;
	case 'mintmesh.com':
		$environment = '_staging';
		break;
	default:
		// default for production
		$environment = '';
		break;
}