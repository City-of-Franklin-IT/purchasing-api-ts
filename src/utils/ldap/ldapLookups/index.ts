import ldap from 'ldapjs'

// Types
import { DepartmentEnum } from '@models/types'

export const adminSearch = async (dept: DepartmentEnum, client: ldap.Client): Promise<unknown> => { // Search department admins

  return new Promise((resolve, reject) => {
    const items: string[] = []

    const options = {
      filter: `(&(memberOf=cn=Dept Purchasing,cn=Users,dc=franklin-gov,dc=com))`,
      scope: 'sub'
    } as ldap.SearchOptions

    client.search('dc=franklin-gov, dc=com', options, (err, res) => {
      res.on('searchEntry', (entry: ldap.SearchEntry) => {
        const userAccountControl = entry.attributes.find(attribute => attribute.type === 'userAccountControl')?.values[0]
        const department = entry.attributes.find(attribute => attribute.type === 'department')?.values[0]
        const email = entry.attributes.find(attribubte => attribubte.type === 'mail')?.values[0]

        if(userAccountControl !== '514' && (department?.toLowerCase() === dept.toLowerCase())) { // Push active account to items[]
          items.push(email as string)
        }
      })

      res.on('error', async (err) => {
        reject(err)
      })
    
      res.on('end', (res) => {
        resolve(items)
      })
    })
  }).catch(error => console.log(error))
}

export const employeeSearch = async (property: string, value: string, client: ldap.Client): Promise<ldap.SearchEntry | undefined> => { // Return employee object

  return new Promise((resolve, reject) => {
    const options = {
      filter: `(&(${ property }=${ value }))`,
      scope: 'sub'
    } as ldap.SearchOptions


    client.search('dc=franklin-gov, dc=com', options, (err, res) => {
      let item: ldap.SearchEntry | undefined

      res.on('searchEntry', (entry: ldap.SearchEntry) => {
        item = entry as ldap.SearchEntry
      })

      res.on('error', async (err) => {
        reject(err)
      })

      res.on('end', (res) => {
        resolve(item)
      })
    })
  })
}

export const searchByJobTitle = async (jobTitle: string, department: DepartmentEnum, client: ldap.Client) => { // Search by job title - return email
  
  return new Promise((resolve, reject) => {

    const options = {
      filter: `(&(title=${ jobTitle })(department=${ department }))`,
      scope: 'sub'
    } as ldap.SearchOptions

    client.search('dc=franklin-gov, dc=com', options, (err,res) => {
      const items: string[] = []

      res.on('searchEntry', (entry) => {
        const email = entry.attributes.find(attribute => attribute.type === 'mail')?.values[0]
        email && items.push(email)
      })

      res.on('error', async (err) => {
        reject(err)
      })

      res.on('end', (res) => {
        resolve(items)
      })
    })
  })
}

export const parksLookup = async (employee: string, client: ldap.Client) => { // Return employees in Parks email chain for new purchases

  if(client.connected) {
    const emails: string[] = []

    const result = await employeeSearch('mail', employee, client)

    if(result) {
      const title = result.attributes.find(attribute => attribute.type === 'title')?.values[0]
      const email = result.attributes.find(attribute => attribute.type === 'mail')?.values[0]
      let manager = result?.attributes.find(attribute => attribute.type === 'manager')?.values[0]

      if(title && title.split(' ').find(obj => ['Superintendent', 'Director'].includes(obj))) { // Check if user is superintendent or director/assistant director
        emails.push(email as string)
      } else { // If not start check manager loop
        emails.push(email as string)

        let test = true

        while(test) { // Bubble up AD until reaching a superintendent
          const result = await checkManager(manager as string, client, emails)

          if(result) {
            manager = result
          } else test = false
        }
      }
    }

    const admins = await adminSearch(DepartmentEnum.PARKS, client) as string[] // Get admins from 

    if(admins.length) {
      emails.push(...admins)
    }

    const inventorySpecialist = await searchByJobTitle('Inventory Specialist', DepartmentEnum.PARKS, client) as string[]

    if(inventorySpecialist.length) {
      emails.push(inventorySpecialist[0])
    }

    client.unbind()
        
    return new Array(...new Set(emails))
  } else return false
}

const checkManager = async (manager: string, client: ldap.Client, emails: string[]) => { // Check if manager is superintendent
  const result = await employeeSearch('distinguishedName', manager, client)

  if(result) {
    const title = result.attributes.find(attribute => attribute.type === 'title')?.values[0]
    const email = result.attributes.find(attribute => attribute.type === 'mail')?.values[0]
    const manager = result.attributes.find(attribute => attribute.type === 'manager')?.values[0]

    if(title?.split(' ').find(obj => ['Superintendent', 'Director'].includes(obj))) { // Target Superintendent
      emails.push(email as string)
      return null
    } else { // If not superintendent - return data.manager to re-start search
      emails.push(email as string)
      return manager as string
    }
  }

  return result
}