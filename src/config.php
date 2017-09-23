<?php
// Global config values should be defiled here
$hostName = gethostname();

// deciding the environment
switch ($hostName) {
	case 'ananya-desktop':
		$environment = '_local';
		break;
	case 'mintmesh.com':
		$environment = '_review';
		break;
	case 'ip-172-31-9-209':
		$environment = '_staging';
		break;
	default:
		// default for production
		$environment = '';
		break;
}