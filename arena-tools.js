(() => {
  "use strict";

  const meta = window.ARENA_STUDENT_META || {};

  // Blue Archive UI icons, sourced from SchaleDB's game asset archive.
  const officialIcons = {"attack":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAGAUExURQAAAP//////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n//7+/v7+/v7+/v//////////////////////////////////////////////\n//////7+/v////////////////7+/v7+/v//////////////////////////\n//////////////7+/v//////////////////////////////////////////\n//////////////////7+/v//////////////////////////////////////\n////////////////////////////////////////////////////////////\n//7+/smIAEUAAAB+dFJOUwAE7xYC/voBA/336Pm9/Ajt1h4F7AtUlJMZ3BIu\n3n23QmTdKArQWywVYukGxwfLpT6SDhAvpPqFH6bycWoge9qd7jax8itB0+M8\n+B0j5WVP6yoNRcnhwoy48CekjmevNRP2P8q+cAkUPJ71InJjazGsm4SqQ7ol\nqavfXhx3SzRGD9cAAAGWSURBVDjLddRVY8IwEADgAIUU3WCMKWMbM2DA3N3d\n3d3d9fjrS+hYw7jc07X5mlzTXAnJDFUlZSVb5ztHh35vdgGRhQ/+olpmcip1\ndCxDVboBp8TkjgnIpuIoZBaQZQM1DV7BgHkWRZ3iRAA9mMnK1kGCxSBiaCuk\nIzuCGo3/kA9B9ZCGJhYR09YhTgOWAazs5rS1YAQzTS0iGhpH96hdrMjuofqI\nwZDKisV9nPOoAnpz1miJsiaY6WFVQCErvNdpE1l10zuvKIqO4mzI9cFPxLXl\nz/gLaFqxhi8XgPWRp0+2X1M+Sem/d/q2s/uxF5Zd1iZN4RTNQOQzxkbCdQoh\n0Ve2uLsG3Z/oPRuzXLHCDDeOQpPkXFdUOdhkzxGWVpukrUbukgXfygGlkTj/\nngAXpYoUqQGXhsD6IFO5K9rJcPBj6dxDTdFSIhmQF+QNbtzF3sytmYQtSE8D\nbC/2yzLbNqfrF63yq21e2SbS3KXL3KxrG3QWZuUfICt2j7LH81Il1kI+Rfu2\nz9y/kLo4KZH8SsgM/jSPHwJzxHUk7mPpAAAAAElFTkSuQmCC\n","defense":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAMAAADW3miqAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAGnUExURQAAAP//////////////////////\n//////////////////////7+/v//////////////////////////////////\n//////////////////////////////////////////////////7+/v//////\n////////////////////////////////////////////////////////////\n//////////////////////////////7+/v////7+/v//////////////////\n//////7+/v////////////7+/v7+/v//////////////////////////////\n//////////////////////////7+/v//////////////////////////////\n//7+/v////////////////////7+/v//////////////////////////////\n////////////////////////////////////////////////////////////\n//////////////////////////////////////////////////////7+/ge/\nHp0AAACLdFJOUwAhGgvX/W8BAwTg1vdgnPe0wPRfV1oM56rq71n+Ds6MHB3+\nxePeuwjRAiesrva+E8YtwVQ0cSnx+b10zdA+Ze7tbX6paOSiz/EcsNSgFaSL\n0vJGLNnTQniHieXfYiMPc33Qpvo/HtgCPEUJH/vD4si484/4BpL8mDnVChmz\n3UqCFCXoESSXIodWEFFiU8m7AAABuElEQVQ4y4XU5XvCMBAG8GJLYdiYAjOY\nG3N3d3d3d3f3hT963e5amtKx+3Zvf/Ak7SUcp6j1/iOe+6d0fQaasxXaJO9S\noRK3Q5nNW/pb4RdZ6oBw+ZNnFOt4PkFtZVk6i9Pr9/tRGUYLjUT+/O7x4Tk7\naY1SfwBRengwNidsRIsohz7ZfnMGCWVaskbkIsqVhAL9ZBGI7HIUn5qqinwy\n5I3TXt/I0T6iFAiEyLzoJjx/YtHvSCgTUTsklUmnGxmQJEQ1x9UACkekBxTG\nvrhGFpkAlbIoDFArtvWA6lgUCagBW3iT1KKKzNjmAYpmUTSLnICiWFQMaDDk\n7nDhI9h2AbKyyArIjm0TID0zZkY9oAXsa/HTu+VoCD/fMPadHdDHagOzrI2F\nzOUR/7kaf5XSK52aAowuM8SoRRyN7hIIVjLFZEZaaIxJzCraynhec27DOaFp\nMYFVVkljFl9u73EZxGGi4/L9ptPgElC6UX4wNWkqik6vMqeXePaCzZSGPeKE\naBKVZiCbKC4Cwl3dM2R5Qqd2YZCXIodI8nyz6rcKIcbCd4ewfYPj9e2P205A\nHMd/fhQUfeUrHn0DUbQrGY52KagAAAAASUVORK5CYII=\n","range":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAA2CAMAAABgIDDNAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAACxUExURQAAAP//////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n/////////////////////////////7eYcpwAAAA6dFJOUwCn+2SsePP9fak8\ntqTEv3NJrmu6+Hri3SPbDQPM1hBON+4Gf7MavSFGaRJSXy0LUHXTYRznS26i\nzuymANqOAAABIUlEQVRIx+3V146DMBAF0AHsMJRQEkp63d574f8/bMcksMkq\n2OZxJe4DksUZgwdbAHTp8g/jZUk2Hs9n/QuPGUslHxZl7F0MJTdbeT9J7MOc\nyfm77/sOpfZDzUVXFf123J614/azPmcZXfJT9y0rep3+4QUD6mqvd8qnKSLe\njY5nB2BNfvBEHrnlikFccgckfnFvcVGBVBCbFW/28ACLq0FZEZtmxYX/bu7/\nxCU+N4XfceHln+slF+/S8/ZDLAJ534O18BUHVHAm9Drn1dhV8HLPf235SmvP\nMHFG3j7TD841Oflgs9lynQKnPn1LauuNPqfdgXir4Ea9ZyiP9ICpPocJ+Uup\nP+IA14gr5fy/HCLESLXcAw6jMAzl/rz7a3RpmR82kxeq0haduAAAAABJRU5E\nrkJggg==\n","tanker":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAFrUExURQAAAP////////////7+/v//////\n////////////////////////////////////////////////////////////\n//////////////////////////////////////////////7+/v//////////\n//////////////////////////////////////////////////////////7+\n/v////7+/v////39/f7+/v7+/v//////////////////////////////////\n//////////////7+/v////7+/v//////////////////////////////////\n//////7+/v////////////7+/v//////////////////////////////////\n//////////7+/v//////////////////////////////////////////////\n//////////////////////////////////7+/tvK+ZUAAAB3dFJOUwD7+gUB\nPPz+/QH44ut0QV5lZ3zf7u0EOwYDHNi9J9HwUDz2cWD5I3N67CUImrBvUehi\n4+nm0ekC8t00YeQMIEcuAkBfGH3N1zZMrTDHoGo9rxBYNVyPTUfy1vOrDRI+\nSzNVhDtIdk6YzbyItro1HWjxniRwIvRtS2lJhwAAAVpJREFUOMvt1FdzgkAQ\nB/ADEhAhilFjL0mMiem999577733dnz8nBiVwT3xzRf/L3cwP3ZumNtFqJTi\nZcGGRJIyElM76JamC8RVNifGc1sIiXns0thGcllb3Mck3SseRPDx2TmIt1l+\nYLanX1VVgYT4w/C9xNbZQWxnkxXVLNZivQDxlA4Ppy2mVI4xWbypSP+YjYFY\nYTLlLOVIvH58ev74ERgFxKu8HmuJywL/BuJWSw5ulAXLL4grBBB/FYo/E1io\nB3ElzsHfCYwbCsWvMg0Dx3h5px3DkfPrRPKKd4A4ajVi7oHcjSiIQxEjviWf\nR0LwhQ4a8EmYbIO0DskcmqkWOY67Ic/MKaVVvOt67KutIbsjL62xxnvT+Ar5\nNSuN0nt1153C/OVdILm6Jn10PDHkwrp07eUdA32eQIayy/NmA2ZkpzPVqAcz\nTeajS4x3tLQ7m9v8pSlerPwB1JuWQ8u5CxEAAAAASUVORK5CYII=\n","dealer":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAGVUExURQAAAP//////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n//////////////////////////////7+/v//////////////////////////\n//////7+/v////////////////////////////////////////////7+/v//\n//////////////7+/v////////7+/v//////////////////////////////\n//////////////////////////7+/v////////////7+/v////7+/v////7+\n/v7+/v////7+/v//////////////////////////////////////////////\n//////////////////////////////7+/kiJWAQAAACFdFJOUwC94fz+CvEB\n+/ryS++Yr2IGCQTlwQsC5mc06fNM9KK7SRVX/UE8wED2fk5f988eHKh7tygO\n4mlUFqEF/kKB+ePq0du6AZbEYSkY7rUkSI0Do62pjh0DYJlEIYCS9Z4QlS8H\noC0UMsUiI7lE/H3jwn18h+lNhRfeKm/GkzffOFDscswzlN09ginCAAABoklE\nQVQ4y2NgGIEgmJGRMVOGSMVJra2tOtxEKuYHKpZNJVJxMktrK48JkYoVuVpb\ndYlSKaqqmcfZ2sppKWHMTkituhpPKxRIyUXiNzaKoxUJiGuF4lYrEIiitrVV\nWkIMl9rEeGWwEocaZbYWTjAzJguXYhlmkDxbc60Kl7ePr4gdiGefjl0tq6l1\nW1ursAKQVe/nzyCUD3ITC68Q1kAxy25ra2OzATEbG0A+sAUZzaSHqViMXdAI\nqLatBMyrawKRgiIg1eboSnm1JVn1mdrarIsUkURd3EG+NGCw4DbkRxIGuo6T\nCeQ9eU8kS0uLvYBCXOLApMKHqhgC2BydXT0gYkpybk5wcUoUY3GGlQpWZ0A8\nCAxVKSI8CAk6kH2FkLgsxxN0kEgBuQMSKZUVeCMFHN1Ax0GiWxgU3QWceKKb\nQUEDHCBV1UgJKTcDR6qzCmcBh5OsvbJ0GSSJakTgTPxxQcxoiT8MTz5k1UTJ\nKsLcAuzEZtiAEMJFQU4aB5FFAQikOLAQWcgAQUIrCcUXuGCUJFJxLKjI1SJS\ncTSwMJdXGonVGAC/c6uQKcKsmwAAAABJRU5ErkJggg==\n","supporter":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAG2UExURQAAAP//////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n//////////////////////7+/v//////////////////////////////////\n//////////////////7+/v////////////7+/v//////////////////////\n////////////////////////////////////////////////////////////\n//////////////////////////7+/v7+/v////7+/v////////7+/v//////\n//////////////7+/hhGku4AAACQdFJOUwADCAT+87MB/ALaGOwbHkiylgki\ngPkK0MXhBxVbcPH1LDji9Bbd/YkOZEYqN+690bpMUiFr3g+bl+fBTx+2DAtB\nX7GK9l3mq4bT+A01bO2u2aVlL9tnYNFXTrQt4B164xp8jFxL+0Qp+8ZNBc2D\nF8vVzEXfFBMzrytCNG33iOW+lH6axpxsRMBHHG9vMBIymX3SxIMAAAGrSURB\nVDjLY2AYNoCTBLWMsSQoTkhkJ16xYrwY8YqTJiQTrVaFZwKbEJFq2eMmTOCJ\nJlIxn9KECROiiAw3daDaCSxBRAVIqChI8QQ/bcIxwxjJClY7gUVJgZBqKRGo\n2gkTOGKM8IcDr8EEJKCmzoRPsRl/MZJiPR1G/O6wkWCBqRVkIujD3nqo2lop\nIoJO2hSsls2eUJrv6eq37XOoAaqVlG5sMKnCmfjyiposQUaKd7IBQ7m6EhSG\ndS2G0liUmokUcEAdW+4A1FHaDOXpi6Abz6yVA4oGSSuL7o6KEgYJllz7srZW\n83YuUNRz6aAkE/YUXaBgvrUwM4SvKaoNiU9jo0KghG4EsmpjZWDgstnB+ekG\ncGOEBICqWfmQFJuDwwqhWCMNVbGXBZLicJDiDAm4M2Agmy8rM3UiUM4TSTAQ\nms4krQRl+RVUmBiYNbiD+TUF9VQ5Jk4EKfZHThByE3ABsGIeYeTQcHXBp1he\nBjWLGXJx4FLOEaCFHoPcsqbY1Vr6cmPJXkwmAlzKqArlQ2zDvHHmKkVHDydx\nN1YONTlVfXdnGR9eToZRQHcAAFqmxoiMGi51AAAAAElFTkSuQmCC\n","healer":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAGSUExURQAAAP////////////7+/v////7+\n/v//////////////////////////////////////////////////////////\n//////////7+/v////7+/v//////////////////////////////////////\n////////////////////////////////////////////////////////////\n//////////////7+/v////////////////////7+/v////////////////7+\n/v7+/v//////////////////////////////////////////////////////\n//////7+/v//////////////////////////////////////////////////\n//////////////////////////////////////////39/f////////////7+\n/v////////////////7+/vv7+///////////////////////////////////\n//////7+/v///////////////////wY+SgIAAACFdFJOUwAZHQwB9x0B/uDe\nCv0PAxy+7AQC/BIG+xnfEd0bqD702PGCCMBmew4TtQfz+u3vDRTKGjdrEW8X\n2fKAwqrcZGCp9tbUkNHJccwL6jTwiCpAbqFSBJW8zyNByGw66Givf8YFQl3n\nGHwVv3CiAbLN6agQ+JxyTAEldXqejn4fF3mSD7D13LSzcc/8AAABrUlEQVQ4\ny+2UVXfCQBCFFxK6uFMotKW4lZa6UXd3d3d31/zvJmxI6JKkLz194j7tnflO\ndjI7uwDk9O+CmrNwaJIztt0wYRFjC3f2VJ6Si6trxmgu/Sbr0PyqXvizoyYt\nxSh2Xw7AjREZ7ckiFIA3PVRaFZVVLs7EJrJZ2QCXVto/XVbOUVtEVhGBUkpE\n1n28kOgan/34SibfG3hvzMfgWSWfVBXSnVHx3r6NwWMZ+6rkAMgzYGoBg08z\nYQMGH2BwpxTcg8HNbHkKWvU0bKhnVmyHujG4A4UfnxwOR50ZAH1CRuuOPSQM\nLkLh2p9dqkbRNgxukYJbMVjXngq/PDudzjd60iw6m62m5jYVdOsw2IzqiBeo\n1eqmPADqmgropSkVHI/iw1Hs5ltHw3l868qqsqbO3CUGBwXmWTMtCCtXfAIX\nBVYes3mXDELuBI0JoVsFIRFB+YbXxsaHMrSO9ANhGIaCWmzwp8qBGAwsy/FM\nVOFdF383SBIMliiRaHapWA+lYPJQfpSG/SPMdlIwCX29CgY+9+pQaZIwBHN9\nFDWzkf6P3548YjhAwNzT/5f6Bo115rQ33cbJAAAAAElFTkSuQmCC\n","vehicle":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAINUExURQAAAP//////////////////////\n//////7+/v//////////////////////////////////////////////////\n//////////7+/v//////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n//////////7+/v//////////////////////////////////////////////\n//7+/v//////////////////////////////////////////////////////\n////////////////////////////////////////////////////////////\n//////////////////////////7+/v////7+/v////////7+/v//////////\n//7+/v////7+/v////7+/v//////////////////////////////////////\n//////////7+/vm8hagAAACtdFJOUwDyCPUDAfr+AQL5/PsFDQzrCgTWRvbX\nvgL9NTPoN0SjBxiiz6kbUb8JMsqPFG9A5rwaNlkT4Z97MYg75MdoKw4vhFZ9\nFfjqOBbxwjpKHNyZWtpQsk2Fsx7GsJbztHOXiQ8ndTp4GZjd8E/vertDeSAJ\nQbZ3ye5m52MiBtGKjsziELkq7Yeq3guB9KtIt9vg6fdxSz76EUikYhl+JoAf\n34JX9iGhLuUkpr2TkMFntEXbngAAAiVJREFUOMtjYBgF+EBloZ6euwJxavnF\n2Li4GEWIUyzFsxYIQlnxq9LIjFRkyM/TYgcpdkuTZeAsruGrwq6WUy1rrWmU\nzFoYYFcpWssor4PVBlYnxrWYgK2VH5viBOu12AD3RAlsLlbHqth1GlZ3iIhC\nnCqmLaJpZWvADFG8GLsH5SDSlqqQ0J4E8epyrGpZlMBOzOaECcxeKrB61coV\ny7Co5QsBGywuiBDyWePBwKIoy4ShNkUAElJSKKIK7r4gysEOVbEYxDs2KMaw\nyLt5LVmkOLlfpoUPWVwYoliJF1lwATBsFnJPmbBubXMTFsX+QsiCUz1BYuvW\nrVvbyIIsDkk9a1VQTLaDKxZvQBLm0IxLB0kEIgUGQ3vdWphidmdOFM8kg2UC\n4AL2cvKghG3aZeYKpOp1ZZGjXVAZpNhPFR6hYIcJWDBwmoNzAyOydzgdJUEp\nI9gQFiVgm7yAKdShE8xE8Y5RBlhMOagAzPUGx2ivCQODMRuIJYwcIJxJbJDg\n46q2tHWeP5fBdxbI+h6p7jagg0SlUaLLJBo5GXNNn8ngMg/IkGTmXgtUbIYS\nGgxM6uwoqV7AiWEOFziBs7Ov1bdAy4PhEah5xJGBxRqm2AA94XHo5IjGqIXp\nQ9XyzFCwgmssd0FXzJGaa8/AlBgvCU5/3nyc0n1rGWPLKszZ1pZ4YCiWAGdk\naW6Q4g4Q07DWGERp6wphOAMIQDSvOFBtqdFoBTGAAABzxh3fI825WgAAAABJ\nRU5ErkJggg==\n","cover":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAwCAMAAABUpcipAAAABGdBTUEAALGP\nC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAA0NDQ8PDxISFQ4ODNHX3BES\nEg8PDw4ODg8PD+nr7pOisOXo7MrQ1/v7+w8PD9PY3tbc4Q0NEhESEuzu8K64\nwoycqtvf5N3i5qWwuxEREX6PoA8PD9fa3gsLCxcXF3iMnIKSoxAQEOLj5BAQ\nEBAQEBISEg4PDw8QEPX19b3Dy7e/yPz8/KGtupyotMDI0F5vhMXL0vr6+g0N\nDQ8PHPv8/AICBGRviOPn63R0dOXo6mRxfdve3tzd3QcmSHV/jObn6I+Yqf//\n/yUlJfr6+oiUpb7DyjdGaZGgrCM3Xvz8/Ck+XSxAWNPT03eDlUxddNTY35eh\nrNTV1oSNlgAPQA0NDfDw8P////v7/CYmJwwhT////7G7xZultXiKnnKGmO7u\n72Bpe4yUo+Hj5U1ZcDtNZH19ff7+/q6uro2ZrZifqzA9W5ygpsrLzNbW2ENR\nbXGBk5+mrra7wUtecmt3htXY3NDQ0JeWlqmpqSQ5TwMmSbW2ueLk5U5lfvX1\n9UFDRGttb/////v8/Pj4+P39/W1sbPv7+6OsvLK8yBo0XP7+/v///7u9xVZW\nVidFZbi7wWZtdJegrsnO1uzs7YiJiau2wO7w8jZDU+rr7RM4WeLj48jKzEdV\nZ5OYnaitsRErQ3mBiiE9YjlNY1lfZ6GhoTdScff39////zAwMAMDA/r6+l5e\nXv39/lZphf39/aexvoOPok5aaV1fYjRHZbrAy4WFhamutOns746ZpszPz7e2\nthQqXKmvtk5OTk9PT+Tv72Bvgr3Aw3uKopOVmgovUY2Vnd/g4QALHgAvU87O\nzvLy8qCgoN3d3TBIX8nPzzRNXpmZmcTExEJAPv7+/pCXnsLQ4oWJk1x6nAAA\nABAsV8jR215eXvn5+kVQbf////7+//39/fHz9Pr7+/T29+3v8nyOofn5+tjc\n4ff4+cTK0vv8/LS8x5SjsY6crI2YqLvDzIORo4iTpICOoM3R2OHl6b3DzJOc\nq624w5misW50fgk0S4KYp5qrtzdPXlpmcXuKkzvpjs0AAAD1dFJOUwAIETAM\n/n4CBQH++P78AYT+/Ddz/vn3/P36a/YV+yCM9fcY/kBcS1JiHPj67vX3+/D7\n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\nSUVORK5CYII=\n"};
  const roleIcon = { A: officialIcons.dealer, T: officialIcons.tanker, SUP: officialIcons.supporter, "回復": officialIcons.healer, "T.S": officialIcons.vehicle };
  const attackTone = { "爆発":"explosion", "貫通":"pierce", "神秘":"mystic", "振動":"sonic" };
  const defenseTone = { "軽装備":"light", "重装甲":"heavy", "特殊装甲":"special", "弾力装甲":"elastic", "複合装甲":"composite" };

  // ----- Rank × 0.7 calculator -----
  const rankInput = document.querySelector("#rank-input");
  const rankResult = document.querySelector("#rank-result");
  const rankTool = document.querySelector("#rank-tool");

  function currentLang() {
    return window.ARENA_LANGUAGE?.get?.() || document.documentElement.lang || "zh-Hant";
  }

  function updateRank() {
    if (!rankInput || !rankResult) return;
    const raw = rankInput.value.trim();
    if (!raw) {
      rankResult.textContent = "—";
      return;
    }
    const rank = Number(raw);
    if (!Number.isFinite(rank) || rank < 1) {
      rankResult.textContent = "—";
      return;
    }
    const value = rank * 0.7;
    rankResult.textContent = Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10);
  }

  function updateRankLanguage() {
    if (!rankTool) return;
    const ja = currentLang() === "ja";
    rankTool.querySelector("[data-rank-title]").textContent = ja ? "順位 × 0.7" : "名次 × 0.7";
    rankTool.querySelector("[data-rank-label]").textContent = ja ? "現在の順位" : "目前名次";
    rankTool.querySelector("[data-rank-output]").textContent = ja ? "× 0.7 の結果" : "× 0.7 結果";
    rankInput.placeholder = ja ? "順位を入力" : "輸入名次";
  }

  rankInput?.addEventListener("input", updateRank);
  updateRank();
  updateRankLanguage();

  // ----- Student metadata tooltip -----
  const tip = document.createElement("div");
  tip.className = "student-tooltip";
  tip.setAttribute("role", "tooltip");
  document.body.append(tip);

  let activeTarget = null;
  let lastX = 0;
  let lastY = 0;

  const zhAttack = { "爆発":"爆發", "貫通":"貫通", "神秘":"神秘", "振動":"振動", "-":"—" };
  const zhDefense = { "軽装備":"輕裝備", "重装甲":"重裝甲", "特殊装甲":"特殊裝甲", "弾力装甲":"彈力裝甲", "複合装甲":"複合裝甲", "-":"—" };
  const zhPosition = { FRONT:"前排", MIDDLE:"中排", BACK:"後排", "-":"—" };
  const zhRole = { A:"輸出", T:"坦克", SUP:"輔助", "回復":"治療", "T.S":"T.S", "例外":"特殊", "-":"—" };

  function studentTarget(node) {
    const root = node?.closest?.(".battle-char, .picker-option, .picker-selected, .avatar-tag");
    if (!root) return null;
    const holder = root.matches("[data-student-name]") ? root : root.querySelector("[data-student-name]");
    return holder?.dataset.studentName ? { root, holder, name: holder.dataset.studentName } : null;
  }

  function displayName(root, jp) {
    return root.querySelector(".picker-selected-name, .picker-option-text strong, .avatar-name, strong")?.textContent.trim() || jp;
  }

  function rowsFor(name) {
    const v = meta[name];
    if (!v) return null;
    const [cover, range, type, position, role, attack, defense] = v;
    const ja = currentLang() === "ja";
    if (ja) {
      return [
        { label:"攻撃タイプ", value:attack || "—", icon:officialIcons.attack, tone:attackTone[attack] || "" },
        { label:"防御タイプ", value:defense || "—", icon:officialIcons.defense, tone:defenseTone[defense] || "" },
        { label:"射程", value:range ?? "—", icon:officialIcons.range },
        { label:"役割", value:role || "—", icon:roleIcon[role] || "" },
        { label:"遮蔽", value:cover === true ? "あり" : cover === false ? "なし" : "—", icon:officialIcons.cover },
      ];
    }
    return [
      { label:"攻擊類型", value:zhAttack[attack] || attack || "—", icon:officialIcons.attack, tone:attackTone[attack] || "" },
      { label:"裝甲", value:zhDefense[defense] || defense || "—", icon:officialIcons.defense, tone:defenseTone[defense] || "" },
      { label:"射程", value:range ?? "—", icon:officialIcons.range },
      { label:"職責", value:zhRole[role] || role || "—", icon:roleIcon[role] || "" },
      { label:"掩體", value:cover === true ? "是" : cover === false ? "否" : "—", icon:officialIcons.cover },
    ];
  }

  function renderTip(target) {
    const rows = rowsFor(target.name);
    if (!rows) return false;
    const title = displayName(target.root, target.name);
    tip.innerHTML = "";
    const head = document.createElement("div");
    head.className = "student-tooltip-name";
    head.textContent = title;
    const grid = document.createElement("div");
    grid.className = "student-tooltip-grid";
    rows.forEach((row) => {
      const icon = document.createElement("span");
      icon.className = "student-tooltip-icon" + (row.tone ? ` tone-${row.tone}` : "");
      if (row.icon) {
        const img = new Image();
        img.src = row.icon;
        img.alt = "";
        img.setAttribute("aria-hidden", "true");
        icon.append(img);
      } else {
        icon.classList.add("empty");
      }
      const label = document.createElement("span");
      label.className = "student-tooltip-label";
      label.textContent = row.label;
      const value = document.createElement("span");
      value.className = "student-tooltip-value";
      value.textContent = row.value;
      grid.append(icon, label, value);
    });
    tip.append(head, grid);
    return true;
  }

  function placeTip(x, y) {
    const gap = 14;
    const pad = 10;
    tip.style.left = "0px";
    tip.style.top = "0px";
    const rect = tip.getBoundingClientRect();
    let left = x + gap;
    let top = y + gap;
    if (left + rect.width > window.innerWidth - pad) left = x - rect.width - gap;
    if (top + rect.height > window.innerHeight - pad) top = y - rect.height - gap;
    tip.style.left = Math.max(pad, left) + "px";
    tip.style.top = Math.max(pad, top) + "px";
  }

  function show(target, x, y) {
    if (!renderTip(target)) return;
    activeTarget = target;
    lastX = x;
    lastY = y;
    tip.classList.add("visible");
    placeTip(x, y);
  }

  function hide() {
    activeTarget = null;
    tip.classList.remove("visible");
  }

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const target = studentTarget(e.target);
    if (!target) return;
    if (activeTarget?.root === target.root) return;
    show(target, e.clientX, e.clientY);
  });

  document.addEventListener("pointermove", (e) => {
    if (!activeTarget || e.pointerType === "touch") return;
    lastX = e.clientX;
    lastY = e.clientY;
    placeTip(lastX, lastY);
  });

  document.addEventListener("pointerout", (e) => {
    if (!activeTarget) return;
    if (activeTarget.root.contains(e.relatedTarget)) return;
    const leaving = e.target.closest?.(".battle-char, .picker-option, .picker-selected, .avatar-tag");
    if (leaving === activeTarget.root) hide();
  });

  window.addEventListener("arena-language-change", () => {
    updateRankLanguage();
    if (activeTarget) {
      renderTip(activeTarget);
      placeTip(lastX, lastY);
    }
  });
})();
