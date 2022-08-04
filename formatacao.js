module.exports = {
  dataInvertida:dataFormatadaInvertida(),
  dataNormal:dataFormatada(),
  dataAnteriorInvertida: dataAnterior()
};

  function dataFormatadaInvertida(){
  const data = new Date();
  const dataBR = data.toLocaleString('pt-br')
  const dataSemHora = dataBR.substr(0,10)
  const dataCortada = dataSemHora.split('/')
  const dia = dataCortada[0]
  const mes = dataCortada[1]
  const ano = dataCortada[2]
  const dataInvertida = `${ano}-${mes}-${dia}`

  return dataInvertida
}
 function dataFormatada(){
 const data = new Date();
 const dataBR = data.toLocaleString('pt-br')
 const dataSemHora = dataBR.substr(0,10)
 const dataCortada = dataSemHora.split('/')
 const dia = dataCortada[0]
 const mes = dataCortada[1]
 const ano = dataCortada[2]
 const dataFormatada = `${dia}-${mes}-${ano}`

 return dataFormatada
 }
 function dataAnterior(){
 const data = new Date();
 const datasAnteriores = data.setDate(data.getDate() - 7)
 const dataBR = datasAnteriores.toLocaleString('pt-br')
 const dataSemHora = dataBR.substr(0,10)
 const dataCortada = dataSemHora.split('/')
 const dia = dataCortada[0]
 const mes = dataCortada[1]
 const ano = dataCortada[2]
 const dataInvertidaAnterior = `${ano}-${mes}-${dia}`

 return dataInvertidaAnterior
 }
