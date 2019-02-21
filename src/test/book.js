import chai, { expect } from 'chai'
import chaiHttp from 'chai-http'
import chaiNock from 'chai-nock'
import chaiAsPromised from 'chai-as-promised'
import path from 'path'
import nock from 'nock'

import server from '../server'
import resetDatabase from '../utils/resetDatabase'

chai.use(chaiHttp)
chai.use(chaiNock)
chai.use(chaiAsPromised)

// tout les packages et fonction nescessaire au test sont importé ici, bon courage

// fait les Tests d'integration en premier
describe('Test intégration (Empty database)', () => {
  const emptyBooks = {
    books: []
  }
  beforeEach(() => {
    resetDatabase(path.join(__dirname, '../data/books.json'), emptyBooks)
  })

  it('should return empty database', done => {
    chai
      .request(server)
      .get('/book')
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.books).to.be.a('array')
        expect(res.body.books.length).to.equal(0)
        done()
      })
  })

  it('should add book in database', done => {
    chai
      .request(server)
      .post('/book',
        {
          'title': 'Coco raconte Channel 2',
          'years': 1990,
          'pages': 400
        })
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully added')
        done()
      })
  })

})

describe('Test intégration (Mocked database)', () => {

})
