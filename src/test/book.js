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
      .post('/book')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        title: 'Coco raconte Channel 2',
        years: 1990,
        pages: 400
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
  const oneBooks = {
    books: [
      {
        id: '0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9',
        title: 'Coco raconte Channel 2',
        years: 1990,
        pages: 400
      }
    ]
  }
  beforeEach(() => {
    resetDatabase(path.join(__dirname, '../data/books.json'), oneBooks)
  })

  it('should update a book', done => {
    chai
      .request(server)
      .put('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        title: 'Coco raconte Channel 42',
        years: 1990,
        pages: 480
      })
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully updated')
        done()
      })
  })

  it('should delete a book', done => {
    chai
      .request(server)
      .delete('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body.message).to.equal('book successfully deleted')
        done()
      })
  })

  it('should get a book', done => {
    chai
      .request(server)
      .get('/book/0db0b43e-dddb-47ad-9b4a-e5fe9ec7c2a9')
      .end((err, res) => {
        if (err) console.log(err)
        expect(res).to.have.status(200)
        expect(res.body.message).to.equal('book fetched')
        expect(res.body.book).to.be.a('object')
        expect(res.body.book.title).to.be.a('string')
        expect(res.body.book.title).to.equal(oneBooks.books[0].title)
        expect(res.body.book.years).to.be.a('number')
        expect(res.body.book.years).to.equal(oneBooks.books[0].years)
        expect(res.body.book.pages).to.be.a('number')
        expect(res.body.book.pages).to.equal(oneBooks.books[0].pages)
        done()
      })
  })
})
