import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <>
      <footer className='bg-dark text-light py-3 footer mt-lg-5'>
        
        designer contacts: 0759838070
        
      <Container>
          <Row className="text-center">   
              <Col xs={12} md={12} 
               className="text-center">
                  <p>&copy; {new Date().getFullYear()} 


                    Interior Design Furniture. All rights reserved.</p>
              </Col>
          </Row>
      </Container>
      </footer>
    </>
  )
}

export default Footer
 