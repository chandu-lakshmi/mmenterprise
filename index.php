<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<!-- This is new comment line for testing SVN -->
<!--another comment line-->
<!-- Shiva kumar -->
<html ng-app="app">
    <head>
        <title>MintMesh</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- <link href="//netdna.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet"> -->
        <link rel="shortcut icon" href="public/images/favicon.png"/>
        <link rel="stylesheet" type="text/css" href="public/css/bootstrap.css">
        <link rel="stylesheet" type="text/css" href="public/css/font-awesome.min.css">
        <link rel="stylesheet" href="public/css/angular-material.min.css">
        <link rel="stylesheet" type="text/css" href="public/css/angular-ui-grid.css">
        <link rel="stylesheet" type="text/css" href="public/css/home.css">
        <link rel="stylesheet" type="text/css" href="public/css/import-contacts.css">
        <script type="text/javascript" src="public/js/vendor/jquery.js"></script>
        <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="public/js/vendor/angular.js"></script>
        <script src="public/js/vendor/angular-animate.min.js"></script>
        <script src="public/js/vendor/angular-aria.min.js"></script>
        <script src="public/js/vendor/angular-messages.min.js"></script>
        <script src="public/js/vendor/angular-material.min.js"></script>
        <script type="text/javascript" src="public/js/vendor/angular-ui-router.js"></script>
        <script type="text/javascript" src="public/js/vendor/angular-ui-grid.js"></script>
        <script src="public/js/vendor/ui-bootstrap-tpls.js"></script>
        <script type="text/javascript">
            (function () {
                "use strict";
                
                angular.module('app.constants', [])
                .constant('App', {
                    base_url: 'http://<?php echo $_SERVER['SERVER_NAME']; ?>/mintmeshent/'
                });
            }());
        </script>
    </head>
    <body>
        <div data-ui-view style="height: 100%" ng-cloak></div>
        
        <script type="text/javascript" src="public/js/controllers/home.js"></script>
        <script type="text/javascript" src="public/js/controllers/company-profile.js"></script>
        <script type="text/javascript" src="public/js/controllers/import-contacts.js"></script>
        <script type="text/javascript" src="public/js/controllers/emails.js"></script>
        <script type="text/javascript" src="public/js/controllers/dashboard.js"></script>
        <script type="text/javascript" src="public/js/controllers/engagement-contacts.js"></script>
        <script type="text/javascript" src="public/js/controllers/post-job.js"></script>
        <script type="text/javascript" src="public/js/controllers/job-search.js"></script>
        <script type="text/javascript" src="public/js/controllers/job-details.js"></script>
        <script type="text/javascript" src="public/js/controllers/rewards.js"></script>
        <script type="text/javascript" src="public/js/app.js"></script>
    </body>
</html>
