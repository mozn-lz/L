const faker =  require('@faker-js/faker');
const { db_read, db_create } = require('./db_helper');
const bcrypt = require('bcrypt');




module.exports.regusrs = () => {
  console.log('* *  * * reg - users');
  let users = [];
  let maxUSers = 500;
  db_read('users', 1, (err, count) => {
    // console.log(count.length);
    if (count.length < maxUSers) {
    // console.log(`looping`);
      for (let i = 0; i < maxUSers; i++) {
        // console.log(`looping ${i} ${maxUSers}`);
        password = "!!11QQqq";
  
        let newUser = {
          title: faker.faker.helpers.arrayElement(["mr", "ms", "mrs"]),
          name: faker.faker.name.firstName(),
          surname: faker.faker.name.lastName(),
          alt_Surname: faker.faker.name.lastName(),
          gender:faker.faker.helpers.arrayElement(["m", "f"]),
          national_id: faker.faker.random.alphaNumeric(13),
          birth: faker.faker.date.birthdate({min: 18, max: 75, mode: 'age'}),
          address: faker.faker.address.streetAddress(false),
          email: faker.faker.internet.email(),
          // usr_psswd: passwordHash.generate(password),
          cell_1: faker.faker.random.numeric(8),
          cell_2: faker.faker.random.numeric(10),
          status: faker.faker.helpers.arrayElement(["single", "married", "widow", "separated", "civil"]),
          policy: faker.faker.helpers.arrayElement(['op1', 'op2', 'op3', 'op4', 'fp1', 'fp2', 'fp3', 'fp4', 'pntU65_1', 'pntU65_2', 'pntU65_3', 'pntU65_4', 'pntO65_1', 'pntO65_2', 'pntO65_3', 'pntO65_4', 'xf1', 'xf2', 'xf3', 'xf4', 'rep1', 'rep2', 'rep3', 'rep4', 'repSp1', 'repSp2', 'repSp3', 'repSp4']),
          beneficiary: '',
          reg_date: faker.faker.date.past(2),
          policy_payment: faker.faker.random.numeric(3)
  
          // confirm_code: Math.random(),
        };
        users.push(newUser);
      }
      setTimeout(() => {
        // console.log(`timed out `);
        for (let i = 0; i < maxUSers; i++) {
          // console.log(`looping ${i} `);
          db_create('users', users[i], (err, res_arr) => { console.log('\t\t', i, ' users created') });
          // console.log(`${i + 1}.${users[i].usr_user} ${users[i].usr_email}`);
        }
      }, 1000);
    } else {
      // console.log(`Users past ${maxUSers}`)
    }
  });

  db_read('admin', 1, (err, count) => {
    let admin = [];
    const maxadmin = 10;
    if (count.length < maxadmin) {
    // console.log(`looping`);
    let password = "!!11QQqq";
      for (let i = 0; i < maxadmin; i++) {
        // console.log(`looping ${i} ${maxUSers}`);
				let newUser = {
						username: faker.faker.name.firstName()+faker.faker.name.lastName(),
						name: faker.faker.name.firstName(),
						surname: faker.faker.name.firstName(),
						email: faker.faker.helpers.arrayElement(['', faker.faker.internet.email()]),
						cell_1: faker.faker.helpers.arrayElement(['', faker.faker.random.numeric(8)]),
						cell_2: faker.faker.helpers.arrayElement(['', faker.faker.random.numeric(10)]),
						password: password,
						active: true,
						rights: '{}'
				};
        admin.push(newUser);
      }
      setTimeout(() => {
        // console.log(`timed out `);
        for (let i = 0; i < maxadmin; i++) {
          console.log(`looping ${i} `);
          bcrypt.hash(password, 10, function(err, hash) {
            admin[i].password = hash;
            db_create('admin', admin[i], (err, res_arr) => { console.log('\t\t', i, ' admin created') });
          });
          // console.log(`${i + 1}.${admin[i].usr_user} ${admin[i].usr_email}`);
        }
      }, 1000)
    }
  });
}
