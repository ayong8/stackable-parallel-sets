dataset_features = {
    'demoemo': [
        { 
            'name': 'gender', 
            'id': 'gender',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1],
            'labels': ['Male', 'Female'],
            'instances': []
        },
        { 
            'name': 'race', 
            'id': 'race',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3, 4, 5],
            'labels': ['Black', 'Asian', 'White', 'Hispanic', 'Indian', 'Other'],
            'instances': []
        },
        { 
            'name': 'income', 
            'id': 'income',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2],
            'labels': ['Under $35', 'Between $35-75', 'Over $75'],
            'instances': []
        },
        { 
            'name': 'education', 
            'id': 'education',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2],
            'labels': ['High School', "Bachelor's Degree", 'Graduate Degree'],
            'instances': []
        },
        { 
            'name': 'children', 
            'id': 'children',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1],
            'labels': ['No', 'Yes'],
            'instances': []
        },
        { 
            'name': 'relationship', 
            'id': 'relationship',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3, 4],
            'labels': ['Single', 'In a relationship', 'Married', 'Divorced', 'Other'],
            'instances': []
        },
        { 
            'name': 'religion', 
            'id': 'religion',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3, 4, 5, 6],
            'labels': ['Unaffiliated', "Christian", 'Other', 'Hindu', 'Jewish', 'Muslim', 'Other'],
            'instances': []
        },
        { 
            'name': 'political', 
            'id': 'political',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3],
            'labels': ['Unaffiliated', "Independent", 'Democrat', 'Republican'],
            'instances': []
        },
        { 
            'name': 'life_satisfaction', 
            'id': 'life_satisfaction',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3, 4],
            'labels': ['Very dissatisfied', 'Dissatisfied', 'None', 'Satisfied', 'Very satisfied'],
            'instances': []
        },
        { 
            'name': 'optimism', 
            'id': 'optimism',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3, 4],
            'labels': ['Extreme pessimist', 'Pessimist', 'None', 'Optimist', 'Extreme optimist'],
            'instances': []
        },
        { 
            'name': 'emotion', 
            'id': 'emotion',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2, 3, 4, 5],
            'labels': ['anger', 'disgust', 'fear', 'joy', 'sadness', 'surprise'],
            'instances': []
        },
        { 
            'name': 'sentiment', 
            'id': 'sentiment',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2],
            'labels': ['neg', 'neu', 'pos'],
            'instances': []
        },
        # { 
        #     'name': 'anger', 
        #     'id': 'anger',
        #     'type': 'categorical',
        #     'scale': '',
        #     'domain': [0, 1],
        #     'labels': [0, 1],
        #     'instances': []
        # },
        # { 
        #     'name': 'sad', 
        #     'id': 'sad',
        #     'type': 'categorical',
        #     'scale': '',
        #     'domain': [0, 1],
        #     'labels': [0, 1],
        #     'instances': []
        # },
        # { 
        #     'name': 'joy', 
        #     'id': 'joy',
        #     'type': 'categorical',
        #     'scale': '',
        #     'domain': [0, 1],
        #     'labels': [0, 1],
        #     'instances': []
        # },
        # { 
        #     'name': 'surprise', 
        #     'id': 'surprise',
        #     'type': 'categorical',
        #     'scale': '',
        #     'domain': [0, 1],
        #     'labels': [0, 1],
        #     'instances': []
        # },
        # { 
        #     'name': 'fear', 
        #     'id': 'fear',
        #     'type': 'categorical',
        #     'scale': '',
        #     'domain': [0, 1],
        #     'labels': [0, 1],
        #     'instances': []
        # },
        # { 
        #     'name': 'disgust', 
        #     'id': 'disgust',
        #     'type': 'categorical',
        #     'scale': '',
        #     'domain': [0, 1],
        #     'labels': [0, 1],
        #     'instances': []
        # }
    ],
    'cancer': [
        { 
            'name': 'Air Pollution', 
            'id': 'air_pollution',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Occupational Hazards', 
            'id': 'occupational_hazards',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Smoking', 
            'id': 'smoking',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Passive Smoker', 
            'id': 'passive_smoker',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Smoking Binary', 
            'id': 'smoking_binary',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1],
            'labels': ['Smoking', 'Non-smoking'],
            'instances': []
        },
        { 
            'name': 'Gender', 
            'id': 'gender',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1],
            'labels': ['Male', 'Female'],
            'instances': []
        },
        { 
            'name': 'Chest Pain', 
            'id': 'chest_pain',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Fatigue', 
            'id': 'fatigue',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Weight Loss', 
            'id': 'weight_loss',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Swallowing Difficulty', 
            'id': 'swallowing_difficulty',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Dry Cough', 
            'id': 'dry_cough',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Coughing of Blood', 
            'id': 'coughing_of_blood',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Shortness of Breath', 
            'id': 'shortness_of_breath',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'instances': []
        },
        { 
            'name': 'Level', 
            'id': 'level',
            'type': 'categorical',
            'scale': '',
            'domain': [0, 1, 2],
            'labels': ['Low', 'Medium', 'High'],
            'instances': []
        },
        { 
            'name': 'QOL', 
            'id': 'qol',
            'type': 'continuous',
            'scale': '',
            'domain': [],
            'labels': [],
            'instances': []
        }
    ],
    'como': [
        { 
          'name': 'RUCC_2013',
          'id': 'rucc_2013',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5,6],
          'labels': [1, 2, 3, 4, 5, 6, 9], 
          'instances': []
        },
        { 
          'name': 'MaritalStatusatDXcode',
          'id': 'maritalstatusatdxcode',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5],
          'labels': [1,2,3,4,5,9], 
          'instances': []
        },
        { 
          'name': 'Nutritional and metabolic disease',
          'id': 'nutritional_and_metabolic_disease',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5],
          'labels': ['None', '24000', '25000', '26000', '27000', 'Multiple'], 
          'instances': []
        },
        { 
          'name': 'Diseases of blood',
          'id': 'diseases_of_blood',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1],
          'labels': ['None', '28000'],
          'instances': []
        },
        { 
          'name': 'Mental disorders',
          'id':'mental_disorders',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4],
          'labels': ['None', '29000', '30000', '31000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Nervous system',
          'id': 'nervous_system',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5,6],
          'labels': ['None', '33000', '34000', '35000', '36000', '38000', 'Multiple'],
          'instances': [] 
        },
        { 
          'name': 'Circulatory system',
          'id':'circulatory_system',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5,6,7],
          'labels': ['None', '39000', '40000', '41000', '42000', '44000', '45000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Respiratory system',
          'id': 'respiratory_system',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4],
          'labels': ['None', '48000', '49000', '51000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Digestive system',
          'id': 'digestive_system',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5,6],
          'labels': ['None', '53000', '54000', '55000', '56000', '57000', 'Multiple'],
          'instances': [] 
        },
        { 
          'name': 'Genitourinary system', 
          'id': 'genitourinary_system',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4,5],
          'labels': ['None', '58000', '59000', '61000', '62000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Skin and subcutaeous',
          'id': 'skin_and_subcutaeous',
          'type': 'categorical',
          'domain': [0,1,2,3],
          'labels': ['None', '68000', '69000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Musculoskeletal system and connective tissue',
          'id': 'musculoskeletal_system_and_connective_tissue',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4],
          'labels': ['None', '71000', '72000', '73000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Congenital anomalies',
          'id': 'cogenital_anomalies',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3],
          'labels': ['None', '78000', '79000', 'Multiple'],
          'instances': []
        },
        { 
          'name': 'Injury and poisoning',
          'id': 'injury_and_poisoning',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1],
          'labels': ['None', '99000'],
          'instances': []
        },
        { 
          'name': 'External causes',
          'id': 'external_causes',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1],
          'labels': ['None', 'E8000'],
          'instances': []
        },
        # diagnosis
        { 
          'name': 'STAGE',
          'id': 'stage',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3,4],
          'labels': ['I', 'II', 'IIIA/B', 'IIIC', 'IV'],
          'instances': []
        },
        { 
          'name': 'CYTO',
          'id': 'cyto',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1],
          'labels': ['R0', 'R1'],
          'instances': []
        },
        { 
          'name': 'GRADE',
          'id': 'grade',
          'type': 'categorical',
          'scale': '',
          'domain': [0,1,2,3],
          'labels': ['1=WELL', '2=MODERATE', '3=POOR', '4=UNDIFF'],
          'instances': []
        },
    ]
}