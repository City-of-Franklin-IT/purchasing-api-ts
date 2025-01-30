import ldap from 'ldapjs'

export const bindServiceAcct = async (): Promise<unknown> => { // Bind ldap client
  const client = ldap.createClient({
    url: [`${ process.env.LDAP_SERVER }`],
    reconnect: true
  })

  return new Promise((resolve, reject) => {
    client.bind(`COF\\${ process.env.AD_SERVICE_ACCT }`, `${ process.env.AD_SERVICE_ACCT_PW }`, (err) => {
      if(err) {
        reject(err)
      } else {
        resolve(client)
      }
    })
  }).catch(error => {
    console.log(error)
  })
}