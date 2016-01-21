var costEstimateConfig = {
    'desktop-app': {
        'name': 'Desktop App',

        'types': {
            'windows': {
                'name': 'Windows',
                'multiplier': 1
            },

            'mac': {
                'name': 'Mac',
                'multiplier': 1
            },

            'linux': {
                'name': 'Linux',
                'multiplier': 1
            }
        },

        'scales': {
            'simple': {
                'pages': 10,
                'name': 'Simple',
                'mandays': 15
            },

            'moderate': {
                'pages': 20,
                'name': 'Moderate',
                'mandays': 25
            },

            'large': {
                'pages': 30,
                'name': 'Large',
                'mandays': 40
            }
        },

        'additional-features': {
            'design': {
                'name': 'Design'
            },

            'admin-system': {
                'name': 'Admin System (10 views)',
                'mandays': 4
            },

            'sns-login': {
                'name': 'Social Network System Login',
                'extraForm': true,
                'each': 1,
                'lists': {
                    'facebook': {
                        'name': 'Facebook'
                    },

                    'google': {
                        'name': 'Google'
                    },

                    'twitter': {
                        'name': 'Twitter'
                    },

                    'instagram': {
                        'name': 'Instagram'
                    }
                }
            },

            'newsletter': {
                'name': 'NewsLetter Sending System',
                'mandays': 3
            },

            'notification': {
                'name': 'Push Notification Sending System',
                'mandays': 3
            },

            'online-payment': {
                'name': 'Online Payment',
                'mandays': 10
            },

            'other-service-integration': {
                'name': 'Other Service Integration ( API Provided Services )',
                'extraForm': true,
                'each': 2
            },

            'data-analytics': {
                'name': 'Data Analytics ( Basic )',
                'mandays': 5
            }
        },

        'quality': {
            'prototype': {
                'name': 'Prototype Quality',
                'multiplier': 1
            },

            'release': {
                'name': 'Release Quality',
                'multiplier': 1.3
            }
        }
    },

    'mobile-app': {
        'name': 'Mobile App',

        'types': {
            'ios-mobile': {
                'name': 'iPhone',
                'multiplier': 1
            },

            'ios-tablet': {
                'name': 'iPad',
                'multiplier': 0.5
            },

            'ios-watch': {
                'name': 'iWatch',
                'multiplier': 0.5
            },

            'android-mobile': {
                'name': 'Android Mobile',
                'multiplier': 1
            },

            'android-tablet': {
                'name': 'Android Tablet',
                'multiplier': 0.5
            },

            'android-watch': {
                'name': 'Android Watch',
                'multiplier': 0.5
            },

            'wp-mobile': {
                'name': 'WindowsPhone Mobile',
                'multiplier': 1
            },

            'wp-tablet': {
                'name': 'WindowsPhone Tablet',
                'multiplier': 0.5
            },

            'wp-watch': {
                'name': 'WindowsPhone Watch',
                'multiplier': 0.5
            }
        },

        'scales': {
            'simple': {
                'pages': 10,
                'name': 'Simple',
                'mandays': 15
            },

            'moderate': {
                'pages': 20,
                'name': 'Moderate',
                'mandays': 25
            },

            'large': {
                'pages': 30,
                'name': 'Large',
                'mandays': 40
            }
        },

        'additional-features': {
            'design': {
                'name': 'Design'
            },

            'admin-system': {
                'name': 'Admin System (10 views)',
                'mandays': 4
            },

            'sns-login': {
                'name': 'Social Network System Login',
                'extraForm': true,
                'each': 1,
                'lists': {
                    'facebook': {
                        'name': 'Facebook'
                    },

                    'google': {
                        'name': 'Google'
                    },

                    'twitter': {
                        'name': 'Twitter'
                    },

                    'instagram': {
                        'name': 'Instagram'
                    }
                }
            },

            'newsletter': {
                'name': 'NewsLetter Sending System',
                'mandays': 3
            },

            'notification': {
                'name': 'Push Notification Sending System',
                'mandays': 3
            },

            'online-payment': {
                'name': 'Online Payment',
                'mandays': 10
            },

            'other-service-integration': {
                'name': 'Other Service Integration ( API Provided Services )',
                'extraForm': true,
                'each': 2
            },

            'data-analytics': {
                'name': 'Data Analytics ( Basic )',
                'mandays': 5
            }
        },

        'quality': {
            'prototype': {
                'name': 'Prototype Quality',
                'multiplier': 1
            },

            'release': {
                'name': 'Release Quality',
                'multiplier': 1.3
            }
        }
    },

    'static-website': {
        'name': 'Static Website',
        'types': {
            'pc': {
                'name': 'PC Site',
                'multiplier': 1
            },

            'mobile': {
                'name': 'Mobile Site',
                'multiplier': 1
            }
        },

        'scales': {
            'simple': {
                'pages': 5,
                'name': 'Simple',
                'mandays': 5
            },

            'moderate': {
                'pages': 10,
                'name': 'Moderate',
                'mandays': 8
            },

            'large': {
                'pages': 20,
                'name': 'Large',
                'mandays': 10
            }
        },

        'additional-features': {
            'responsive': {
                'name': 'Responsive Site Support'
            },

            'design': {
                'name': 'Design'
            },

            'contact-form': {
                'name': 'Contact Form',
                'mandays': 1
            },

            'cms-original': {
                'name': 'CMS ( Original )',
                'mandays': 10
            },

            'cms-wordpress': {
                'name': 'CMS ( Word Press )',
                'mandays': 4
            }
        },

        'quality': {
            'prototype': {
                'name': 'Prototype Quality',
                'multiplier': 1
            },

            'release': {
                'name': 'Release Quality',
                'multiplier': 1.3
            }
        }
    },

    'web-app': {
        'name': 'Web App',

        'types': {
            'pc': {
                'name': 'PC Site',
                'multiplier': 1
            },

            'mobile': {
                'name': 'Mobile Site',
                'multiplier': 1
            }
        },

        'scales': {
            'simple': {
                'pages': 10,
                'name': 'Simple',
                'mandays': 15
            },

            'moderate': {
                'pages': 20,
                'name': 'Moderate',
                'mandays': 25
            },

            'large': {
                'pages': 30,
                'name': 'Large',
                'mandays': 40
            }
        },

        'additional-features': {
            'responsive': {
                'name': 'Responsive Site Support'
            },

            'design': {
                'name': 'Design'
            },

            'admin-system': {
                'name': 'Admin System (10 views)',
                'mandays': 4
            },

            'sns-login': {
                'name': 'Social Network System Login',
                'extraForm': true,
                'each': 1,
                'lists': {
                    'facebook': {
                        'name': 'Facebook'
                    },

                    'google': {
                        'name': 'Google'
                    },

                    'twitter': {
                        'name': 'Twitter'
                    },

                    'instagram': {
                        'name': 'Instagram'
                    }
                }
            },

            'newsletter': {
                'name': 'NewsLetter Sending System',
                'mandays': 3
            },

            'notification': {
                'name': 'Push Notification Sending System',
                'mandays': 3
            },

            'online-payment': {
                'name': 'Online Payment',
                'mandays': 10
            },

            'other-service-integration': {
                'name': 'Other Service Integration ( API Provided Services )',
                'extraForm': true,
                'each': 2
            },

            'data-analytics': {
                'name': 'Data Analytics ( Basic )',
                'mandays': 5
            }
        },

        'quality': {
            'prototype': {
                'name': 'Prototype Quality',
                'multiplier': 1
            },

            'release': {
                'name': 'Release Quality',
                'multiplier': 1.3
            }
        }
    }
};