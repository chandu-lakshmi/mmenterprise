<?php

// API settings
return [
		   'login' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/login'
            ],
            'create_user' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/create_user'
            ],
            'get_industries' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_industries'
            ],
            'get_employment_types' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_employment_types'
            ],
            'get_experiences' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_experiences'
            ],
            'get_job_functions' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_job_functions'
            ],
            'update_company' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/update_company'
            ],
            'verify_email' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/verify_email'
            ],
            'buckets_list' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/buckets_list'
            ],
            'contacts_list' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/contacts_list'
            ],
            'contacts_upload' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/contacts_upload'
            ],
            'email_invitation' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/email_invitation'
            ],
            'post_job' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/post_job'
            ],
            'forgot_password' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/forgot_password'
            ],
            'reset_password' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/reset_password'
            ],
            'set_password' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/set_password'
            ],
            'jobs_list' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/jobs_list'
            ],
            'job_details' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/job_details'
            ],
            'deactivate_post' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/deactivate_post'
            ],
           /* 'get_user_details' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_user_details'
            ],*/
            
            'job_referral_details' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/job_referral_details'
            ],
            'get_services' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/get_services'
            ],
            'process_job' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/process_job'
            ],
            'view_company_details' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/view_company_details'
            ],
            'get_company_profile' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_company_profile'
            ],
            'awaiting_action' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/awaiting_action'
            ],
            'view_dashboard' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/view_dashboard'
            ],
            'update_contacts_list' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/update_contacts_list'
            ],
            'validate_headers' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/validate_headers'
            ],
            'create_bucket' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/create_bucket'
            ],
            'other_edits_in_contact_list' => [ 
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/other_edits_in_contact_list'
            ],
            'add_contact' => [ 
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/add_contact'
            ],
            'upload_contacts' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/upload_contacts'
            ],
            'permissions' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/permissions'
            ],
            'add_user' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/add_user'
            ],
             'add_group' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/add_group'
            ],
            'get_groups' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_groups'
            ],
            'get_user_permissions' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_user_permissions'
            ],
            'update_user' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/update_user'
            ], 
            'change_password' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/change_password'
            ],
            'job_rewards' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/job_rewards'
            ],
            'add_campaign' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/add_campaign'
            ],
            'campaigns_list' => [
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/campaigns_list'
            ],
            'view_campaign' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/view_campaign'
            ],
            'resend_activation_link' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/resend_activation_link'
            ],
            'get_company_all_referrals' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_company_all_referrals'
            ],
            'add_job' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/add_job'
            ],
            'multiple_awaiting_action' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/multiple_awaiting_action'
            ],
            'apply_job' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/apply_job'
            ],
            'apply_jobs_list' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/apply_jobs_list'
            ],
            'decrypt_ref' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/decrypt_ref'
            ],
            'job_post_from_campaigns' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/job_post_from_campaigns'
            ],
           'apply_job_details' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/apply_job_details'
            ],
            'decrypt_campaign_ref' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/decrypt_campaign_ref'
            ],
            'campaign_jobs_list' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/campaign_jobs_list'
            ],
            'special_grant_login' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/special_grant_login'
            ],
            'get_company_subscriptions' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_company_subscriptions'
            ],
            'company_integration' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/company_integration'
            ],
            'add_edit_hcm' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/add_edit_hcm'
            ],
            'get_hcm_list' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_hcm_list'
            ],
            'get_hcm_partners' =>[
                'VERSION' => 'v1',
                'ENDPOINT' => '/enterprise/get_hcm_partners'
            ]
    ];
        